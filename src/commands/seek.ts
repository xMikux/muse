import {ChatInputCommandInteraction} from 'discord.js';
import {TYPES} from '../types.js';
import {inject, injectable} from 'inversify';
import PlayerManager from '../managers/player.js';
import Command from './index.js';
import {parseTime, prettyTime} from '../utils/time.js';
import {SlashCommandBuilder} from '@discordjs/builders';
import durationStringToSeconds from '../utils/duration-string-to-seconds.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('seek')
    .setDescription('從歌曲開始處快轉到指定位置')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('時間間隔表達式或秒數（1m, 30s, 100）')
        .setRequired(true),
    );

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);

    const currentSong = player.getCurrent();

    if (!currentSong) {
      throw new Error('沒有歌曲正在播放');
    }

    if (currentSong.isLive) {
      throw new Error('你不能快轉直播');
    }

    const time = interaction.options.getString('time')!;

    let seekTime = 0;

    if (time.includes(':')) {
      seekTime = parseTime(time);
    } else {
      seekTime = durationStringToSeconds(time);
    }

    if (seekTime > currentSong.length) {
      throw new Error('無法快轉到歌曲結束之後');
    }

    await Promise.all([
      player.seek(seekTime),
      interaction.deferReply(),
    ]);

    await interaction.editReply(`👍 已快轉至 ${prettyTime(player.getPosition())}`);
  }
}
