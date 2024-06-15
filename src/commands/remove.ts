import {ChatInputCommandInteraction} from 'discord.js';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {SlashCommandBuilder} from '@discordjs/builders';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('從隊列中移除歌')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('要移除的歌曲位置 [預設: 1]')
        .setRequired(false),
    )
    .addIntegerOption(option =>
      option.setName('range')
        .setDescription('要移除的歌曲數量 [預設: 1]')
        .setRequired(false));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const position = interaction.options.getInteger('position') ?? 1;
    const range = interaction.options.getInteger('range') ?? 1;

    if (position < 1) {
      throw new Error('位置必須至少為 1');
    }

    if (range < 1) {
      throw new Error('範圍必須至少為 1');
    }

    player.removeFromQueue(position, range);

    await interaction.reply(':wastebasket: 已移除');
  }
}
