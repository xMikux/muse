import getYouTubeID from 'get-youtube-id';
import {EmbedBuilder} from 'discord.js';
import Player, {MediaSource, QueuedSong, STATUS} from '../services/player.js';
import getProgressBar from './get-progress-bar.js';
import {prettyTime} from './time.js';
import {truncate} from './string.js';

const getMaxSongTitleLength = (title: string) => {
  // eslint-disable-next-line no-control-regex
  const nonASCII = /[^\x00-\x7F]+/;
  return nonASCII.test(title) ? 28 : 48;
};

const getSongTitle = ({title, url, offset, source}: QueuedSong, shouldTruncate = false) => {
  if (source === MediaSource.HLS) {
    return `[${title}](${url})`;
  }

  const cleanSongTitle = title.replace(/\[.*\]/, '').trim();

  const songTitle = shouldTruncate ? truncate(cleanSongTitle, getMaxSongTitleLength(cleanSongTitle)) : cleanSongTitle;
  const youtubeId = url.length === 11 ? url : getYouTubeID(url) ?? '';

  return `[${songTitle}](https://www.youtube.com/watch?v=${youtubeId}${offset === 0 ? '' : '&t=' + String(offset)})`;
};

const getQueueInfo = (player: Player) => {
  const queueSize = player.queueSize();
  if (queueSize === 0) {
    return '-';
  }

  return queueSize === 1 ? '1 首歌曲' : `${queueSize} 首歌曲`;
};

const getPlayerUI = (player: Player) => {
  const song = player.getCurrent();

  if (!song) {
    return '';
  }

  const position = player.getPosition();
  const button = player.status === STATUS.PLAYING ? '⏹️' : '▶️';
  const progressBar = getProgressBar(10, position / song.length);
  const elapsedTime = song.isLive ? '直播' : `${prettyTime(position)}/${prettyTime(song.length)}`;
  const loop = player.loopCurrentSong ? '🔂' : player.loopCurrentQueue ? '🔁' : '';
  const vol: string = typeof player.getVolume() === 'number' ? `${player.getVolume()!}%` : '';
  return `${button} ${progressBar} \`[${elapsedTime}]\`🔉 ${vol} ${loop}`;
};

export const buildPlayingMessageEmbed = (player: Player): EmbedBuilder => {
  const currentlyPlaying = player.getCurrent();

  if (!currentlyPlaying) {
    throw new Error('找不到正在播放的歌曲');
  }

  const {artist, thumbnailUrl, requestedBy} = currentlyPlaying;
  const message = new EmbedBuilder();
  message
    .setColor(player.status === STATUS.PLAYING ? 'DarkGreen' : 'DarkRed')
    .setTitle(player.status === STATUS.PLAYING ? '正在播放' : '暫停')
    .setDescription(`
      **${getSongTitle(currentlyPlaying)}**
      請求者: <@${requestedBy}>\n
      ${getPlayerUI(player)}
    `)
    .setFooter({text: `來源：${artist}`});

  if (thumbnailUrl) {
    message.setThumbnail(thumbnailUrl);
  }

  return message;
};

export const buildQueueEmbed = (player: Player, page: number, pageSize: number): EmbedBuilder => {
  const currentlyPlaying = player.getCurrent();

  if (!currentlyPlaying) {
    throw new Error('佇列是空的');
  }

  const queueSize = player.queueSize();
  const maxQueuePage = Math.ceil((queueSize + 1) / pageSize);

  if (page > maxQueuePage) {
    throw new Error('佇列沒有想像的那麼大');
  }

  const queuePageBegin = (page - 1) * pageSize;
  const queuePageEnd = queuePageBegin + pageSize;
  const queuedSongs = player
    .getQueue()
    .slice(queuePageBegin, queuePageEnd)
    .map((song, index) => {
      const songNumber = index + 1 + queuePageBegin;
      const duration = song.isLive ? '直播' : prettyTime(song.length);

      return `\`${songNumber}.\` ${getSongTitle(song, true)} \`[${duration}]\``;
    })
    .join('\n');

  const {artist, thumbnailUrl, playlist, requestedBy} = currentlyPlaying;
  const playlistTitle = playlist ? `(${playlist.title})` : '';
  const totalLength = player.getQueue().reduce((accumulator, current) => accumulator + current.length, 0);

  const message = new EmbedBuilder();

  let description = `**${getSongTitle(currentlyPlaying)}**\n`;
  description += `請求者：<@${requestedBy}>\n\n`;
  description += `${getPlayerUI(player)}\n\n`;

  if (player.getQueue().length > 0) {
    description += '**接下來：**\n';
    description += queuedSongs;
  }

  message
    .setTitle(player.status === STATUS.PLAYING ? `正在播放 ${player.loopCurrentSong ? '（循環）' : ''}` : '佇列歌曲')
    .setColor(player.status === STATUS.PLAYING ? 'DarkGreen' : 'NotQuiteBlack')
    .setDescription(description)
    .addFields([{name: '佇列中', value: getQueueInfo(player), inline: true}, {
      name: '總播放長度', value: `${totalLength > 0 ? prettyTime(totalLength) : '-'}`, inline: true,
    }, {name: '頁數', value: `${page}/${maxQueuePage} 頁`, inline: true}])
    .setFooter({text: `來源：${artist} ${playlistTitle}`});

  if (thumbnailUrl) {
    message.setThumbnail(thumbnailUrl);
  }

  return message;
};

