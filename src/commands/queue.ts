import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {buildQueueEmbed} from '../utils/build-embed.js';
import {getGuildSettings} from '../utils/get-guild-settings.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('顯示目前的歌曲佇列')
    .addIntegerOption(option => option
      .setName('page')
      .setDescription('顯示佇列的頁數 [預設：1]')
      .setRequired(false))
    .addIntegerOption(option => option
      .setName('page-size')
      .setDescription('每頁顯示的項目數量 [預設：10，最大：30]')
      .setMinValue(1)
      .setMaxValue(30)
      .setRequired(false));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const guildId = interaction.guild!.id;
    const player = this.playerManager.get(guildId);

    const pageSizeFromOptions = interaction.options.getInteger('page-size');
    const pageSize = pageSizeFromOptions ?? (await getGuildSettings(guildId)).defaultQueuePageSize;

    const embed = buildQueueEmbed(
      player,
      interaction.options.getInteger('page') ?? 1,
      pageSize,
    );

    await interaction.reply({embeds: [embed]});
  }
}
