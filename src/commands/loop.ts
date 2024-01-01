import {ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from '.';
import {SlashCommandBuilder} from '@discordjs/builders';
import {STATUS} from '../services/player.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('切換歌曲的循環播放');

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    if (player.status === STATUS.IDLE) {
      throw new Error('沒有歌曲可循環播放！');
    }

    player.loopCurrentSong = !player.loopCurrentSong;

    await interaction.reply((player.loopCurrentSong ? '開始循環播放 :)' : '停止循環播放 :('));
  }
}
