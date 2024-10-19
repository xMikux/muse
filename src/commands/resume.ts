import {SlashCommandBuilder} from '@discordjs/builders';
import {inject, injectable} from 'inversify';
import Command from './index.js';
import {TYPES} from '../types.js';
import PlayerManager from '../managers/player.js';
import {STATUS} from '../services/player.js';
import {buildPlayingMessageEmbed} from '../utils/build-embed.js';
import {getMemberVoiceChannel, getMostPopularVoiceChannel} from '../utils/channels.js';
import {ChatInputCommandInteraction, GuildMember} from 'discord.js';

@injectable()
export default class implements Command {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('繼續播放音樂');

  public requiresVC = true;

  private readonly playerManager: PlayerManager;

  constructor(@inject(TYPES.Managers.Player) playerManager: PlayerManager) {
    this.playerManager = playerManager;
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = this.playerManager.get(interaction.guild!.id);
    const [targetVoiceChannel] = getMemberVoiceChannel(interaction.member as GuildMember) ?? getMostPopularVoiceChannel(interaction.guild!);
    if (player.status === STATUS.PLAYING) {
      throw new Error('音樂已經在播放中，請提供新的歌曲名稱');
    }

    // Must be resuming play
    if (!player.getCurrent()) {
      throw new Error('目前沒有可播放的歌曲');
    }

    await player.connect(targetVoiceChannel);
    await player.play();

    await interaction.reply({
      content: '紅綠燈現在已變成綠燈',
      embeds: [buildPlayingMessageEmbed(player)],
    });
  }
}
