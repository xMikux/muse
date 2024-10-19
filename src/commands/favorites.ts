import {SlashCommandBuilder} from '@discordjs/builders';
import {APIEmbedField, AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {inject, injectable} from 'inversify';
import Command from './index.js';
import AddQueryToQueue from '../services/add-query-to-queue.js';
import {TYPES} from '../types.js';
import {prisma} from '../utils/db.js';
import {Pagination} from 'pagination.djs';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('favorites')
    .setDescription('將歌曲加入你的收藏')
    .addSubcommand(subcommand => subcommand
      .setName('use')
      .setDescription('使用收藏內的歌曲')
      .addStringOption(option => option
        .setName('name')
        .setDescription('收藏的名稱')
        .setRequired(true)
        .setAutocomplete(true))
      .addBooleanOption(option => option
        .setName('immediate')
        .setDescription('將歌曲新增到佇列最前面'))
      .addBooleanOption(option => option
        .setName('shuffle')
        .setDescription('如果你要新增多首歌曲，則會隨機播放'))
      .addBooleanOption(option => option
        .setName('split')
        .setDescription('如果歌曲有章節，則將其拆分'))
      .addBooleanOption(option => option
        .setName('skip')
        .setDescription('跳過目前正在播放的歌曲')))
    .addSubcommand(subcommand => subcommand
      .setName('list')
      .setDescription('列出所有收藏'))
    .addSubcommand(subcommand => subcommand
      .setName('create')
      .setDescription('建立新收藏')
      .addStringOption(option => option
        .setName('name')
        .setDescription('你在使用此收藏時將輸入此名稱')
        .setRequired(true))
      .addStringOption(option => option
        .setName('query')
        .setDescription('任何你通常會提供給播放指令的輸入')
        .setRequired(true),
      ))
    .addSubcommand(subcommand => subcommand
      .setName('remove')
      .setDescription('移除收藏')
      .addStringOption(option => option
        .setName('name')
        .setDescription('收藏的名稱')
        .setAutocomplete(true)
        .setRequired(true),
      ),
    );

  constructor(@inject(TYPES.Services.AddQueryToQueue) private readonly addQueryToQueue: AddQueryToQueue) {
  }

  requiresVC = (interaction: ChatInputCommandInteraction) => interaction.options.getSubcommand() === 'use';

  async execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
      case 'use':
        await this.use(interaction);
        break;
      case 'list':
        await this.list(interaction);
        break;
      case 'create':
        await this.create(interaction);
        break;
      case 'remove':
        await this.remove(interaction);
        break;
      default:
        throw new Error('unknown subcommand');
    }
  }

  async handleAutocompleteInteraction(interaction: AutocompleteInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const query = interaction.options.getString('name')!.trim();

    const favorites = await prisma.favoriteQuery.findMany({
      where: {
        guildId: interaction.guild!.id,
      },
    });

    let results = query === '' ? favorites : favorites.filter(f => f.name.toLowerCase().startsWith(query.toLowerCase()));

    if (subcommand === 'remove') {
      // Only show favorites that user is allowed to remove
      results = interaction.member?.user.id === interaction.guild?.ownerId ? results : results.filter(r => r.authorId === interaction.member!.user.id);
    }

    // Limit results to 25 maximum per Discord limits
    const trimmed = results.length > 25 ? results.slice(0, 25) : results;
    await interaction.respond(trimmed.map(r => ({
      name: r.name,
      value: r.name,
    })));
  }

  private async use(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('name')!.trim();

    const favorite = await prisma.favoriteQuery.findFirst({
      where: {
        name,
        guildId: interaction.guild!.id,
      },
    });

    if (!favorite) {
      throw new Error('並未存在該名稱的收藏');
    }

    await this.addQueryToQueue.addToQueue({
      interaction,
      query: favorite.query,
      shuffleAdditions: interaction.options.getBoolean('shuffle') ?? false,
      addToFrontOfQueue: interaction.options.getBoolean('immediate') ?? false,
      shouldSplitChapters: interaction.options.getBoolean('split') ?? false,
      skipCurrentTrack: interaction.options.getBoolean('skip') ?? false,
    });
  }

  private async list(interaction: ChatInputCommandInteraction) {
    const favorites = await prisma.favoriteQuery.findMany({
      where: {
        guildId: interaction.guild!.id,
      },
    });

    if (favorites.length === 0) {
      await interaction.reply('目前還沒有收藏存在');
      return;
    }

    const fields = new Array<APIEmbedField>(favorites.length);
    for (let index = 0; index < favorites.length; index++) {
      const favorite = favorites[index];
      fields[index] = {
        inline: false,
        name: favorite.name,
        value: `${favorite.query} (<@${favorite.authorId}>)`,
      };
    }

    await new Pagination(
      interaction as ChatInputCommandInteraction<'cached'>,
      {ephemeral: true, limit: 25})
      .setFields(fields)
      .paginateFields(true)
      .render();
  }

  private async create(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('name')!.trim();
    const query = interaction.options.getString('query')!.trim();

    const existingFavorite = await prisma.favoriteQuery.findFirst({where: {
      guildId: interaction.guild!.id,
      name,
    }});

    if (existingFavorite) {
      throw new Error('已存在同名稱的收藏');
    }

    await prisma.favoriteQuery.create({
      data: {
        authorId: interaction.member!.user.id,
        guildId: interaction.guild!.id,
        name,
        query,
      },
    });

    await interaction.reply('👍 收藏已建立');
  }

  private async remove(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('name')!.trim();

    const favorite = await prisma.favoriteQuery.findFirst({where: {
      name,
      guildId: interaction.guild!.id,
    }});

    if (!favorite) {
      throw new Error('不存在同名稱的收藏');
    }

    const isUserGuildOwner = interaction.member!.user.id === interaction.guild!.ownerId;

    if (favorite.authorId !== interaction.member!.user.id && !isUserGuildOwner) {
      throw new Error('你只能移除你自己的收藏');
    }

    await prisma.favoriteQuery.delete({where: {id: favorite.id}});

    await interaction.reply('👍 收藏已移除');
  }
}
