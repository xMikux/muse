import {SlashCommandBuilder} from '@discordjs/builders';
import {ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits} from 'discord.js';
import {injectable} from 'inversify';
import {prisma} from '../utils/db.js';
import Command from './index.js';
import {getGuildSettings} from '../utils/get-guild-settings.js';

/* eslint-disable quote-props */

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('config')
    .setDescription('配置機器人設定')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addSubcommand(subcommand => subcommand
      .setName('set-playlist-limit')
      .setDescription('設定播放清單可加入的最大歌曲數量')
      .addIntegerOption(option => option
        .setName('limit')
        .setDescription('最大的歌曲數量')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-wait-after-queue-empties')
      .setDescription('設定當隊列為空時，離開語音頻道的等待時間')
      .addIntegerOption(option => option
        .setName('delay')
        .setDescription('以秒為單位的延遲（設定 0 來永不離開）')
        .setRequired(true)
        .setMinValue(0)))
    .addSubcommand(subcommand => subcommand
      .setName('set-leave-if-no-listeners')
      .setDescription('設定所有在語音頻道內的人離開時是否離開')
      .addBooleanOption(option => option
        .setName('value')
        .setDescription('其他人離開時是否離開')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('get')
      .setDescription('顯示所有設定'));

  async execute(interaction: ChatInputCommandInteraction) {
    switch (interaction.options.getSubcommand()) {
      case 'set-playlist-limit': {
        const limit: number = interaction.options.getInteger('limit')!;

        if (limit < 1) {
          throw new Error('無效限制');
        }

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            playlistLimit: limit,
          },
        });

        await interaction.reply('👍 限制已更新');

        break;
      }

      case 'set-wait-after-queue-empties': {
        const delay = interaction.options.getInteger('delay')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            secondsToWaitAfterQueueEmpties: delay,
          },
        });

        await interaction.reply('👍 等待延遲已更新');

        break;
      }

      case 'set-leave-if-no-listeners': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            leaveIfNoListeners: value,
          },
        });

        await interaction.reply('👍 離開設定已更新');

        break;
      }

      case 'get': {
        const embed = new EmbedBuilder().setTitle('配置');

        const config = await getGuildSettings(interaction.guild!.id);

        const settingsToShow = {
          '播放清單限制': config.playlistLimit,
          '隊列空時等待離開延遲': config.secondsToWaitAfterQueueEmpties === 0
            ? '永不離開'
            : `${config.secondsToWaitAfterQueueEmpties}s`,
          '當沒有人在聽時離開': config.leaveIfNoListeners ? 'yes' : 'no',
        };

        let description = '';
        for (const [key, value] of Object.entries(settingsToShow)) {
          description += `**${key}**: ${value}\n`;
        }

        embed.setDescription(description);

        await interaction.reply({embeds: [embed]});

        break;
      }

      default:
        throw new Error('unknown subcommand');
    }
  }
}
