import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import {STATUS} from '../services/player.js';
import Command from './index.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('停止播放，中斷連線並清空佇列中所有歌曲');

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction) {
    const player = this.playerManager.get(interaction.guild!.id);

    if (!player.voiceConnection) {
      throw new Error('未連接');
    }

    if (player.status !== STATUS.PLAYING) {
      throw new Error('目前沒有播放任何內容');
    }

    player.stop();
    await interaction.reply('當然好，已停止播放');
  }
}
