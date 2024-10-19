import {ChatInputCommandInteraction} from 'discord.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {prettyTime} from '../utils/time.js';
import durationStringToSeconds from '../utils/duration-string-to-seconds.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('fseek')
    .setDescription('在目前歌曲中快轉')
    .addStringOption(option => option
      .setName('time')
      .setDescription('間隔表達式或秒數（例如：1m、30s、100）')
      .setRequired(true));

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const currentSong = player.getCurrent();

    if (!currentSong) {
      throw new Error('目前沒有播放任何歌曲');
    }

    if (currentSong.isLive) {
      throw new Error('無法在直播中快轉');
    }

    const seekValue = interaction.options.getString('time');

    if (!seekValue) {
      throw new Error('缺少快轉值');
    }

    const seekTime = durationStringToSeconds(seekValue);

    if (seekTime + player.getPosition() > currentSong.length) {
      throw new Error('無法快轉到歌曲結束之後');
    }

    await Promise.all([
      player.forwardSeek(seekTime),
      interaction.deferReply(),
    ]);

    await interaction.editReply(`👍 快轉到 ${prettyTime(player.getPosition())}`);
  }
}
