import {ChatInputCommandInteraction} from 'discord.js';
import {inject, injectable} from 'inversify';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import Command from '.';
import {SlashCommandBuilder} from '@discordjs/builders';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('move')
    .setDescription('在隊列中移動歌曲')
    .addIntegerOption(option =>
      option.setName('from')
        .setDescription('要移動的歌曲位置')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('to')
        .setDescription('歌曲移動到的位置')
        .setRequired(true));

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const from = interaction.options.getInteger('from') ?? 1;
    const to = interaction.options.getInteger('to') ?? 1;

    if (from < 1) {
      throw new Error('位置必須至少為 1');
    }

    if (to < 1) {
      throw new Error('位置必須至少為 1');
    }

    const {title} = player.move(from, to);

    await interaction.reply('已移動 **' + title + '** 到位置 **' + String(to) + '**');
  }
}
