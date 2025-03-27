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
    .setDescription('設定機器人')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
    .addSubcommand(subcommand => subcommand
      .setName('set-playlist-limit')
      .setDescription('設定從播放清單中新增的歌曲的最大數量')
      .addIntegerOption(option => option
        .setName('limit')
        .setDescription('最大歌曲數量')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-wait-after-queue-empties')
      .setDescription('設定佇列清空後等待離開語音頻道的時間')
      .addIntegerOption(option => option
        .setName('delay')
        .setDescription('延遲秒數（設定為 0 表示永不離開）')
        .setRequired(true)
        .setMinValue(0)))
    .addSubcommand(subcommand => subcommand
      .setName('set-leave-if-no-listeners')
      .setDescription('設定無聽眾時離開')
      .addBooleanOption(option => option
        .setName('value')
        .setDescription('是否在無聽眾時離開')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-queue-add-response-hidden')
      .setDescription('設定機器人對佇列新增請求的回應是否僅顯示給請求者')
      .addBooleanOption(option => option
        .setName('value')
        .setDescription('機器人對佇列新增請求的回應是否僅顯示給請求者')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-reduce-vol-when-voice')
      .setDescription('設定當有人說話時是否降低音量')
      .addBooleanOption(option => option
        .setName('value')
        .setDescription('當有人說話時是否降低音量')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-reduce-vol-when-voice-target')
      .setDescription('設定當有人說話時的目標音量')
      .addIntegerOption(option => option
        .setName('volume')
        .setDescription('音量百分比（0 為靜音，100 為最大且預設值）')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-auto-announce-next-song')
      .setDescription('設定自動宣佈下一首歌曲')
      .addBooleanOption(option => option
        .setName('value')
        .setDescription('是否自動宣佈佇列中的下一首歌曲')
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-default-volume')
      .setDescription('設定預設進入語音頻道使用的音量')
      .addIntegerOption(option => option
        .setName('level')
        .setDescription('音量百分比（0 為靜音，100 為最大值和預設值）')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('set-default-queue-page-size')
      .setDescription('設定 /queue 指令的預設頁面大小')
      .addIntegerOption(option => option
        .setName('page-size')
        .setDescription('/queue 指令的頁面大小')
        .setMinValue(1)
        .setMaxValue(30)
        .setRequired(true)))
    .addSubcommand(subcommand => subcommand
      .setName('get')
      .setDescription('顯示所有設定'));

  async execute(interaction: ChatInputCommandInteraction) {
    // Ensure guild settings exist before trying to update
    await getGuildSettings(interaction.guild!.id);

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

      case 'set-queue-add-response-hidden': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            queueAddResponseEphemeral: value,
          },
        });

        await interaction.reply('👍 佇列新增通知設定已更新');

        break;
      }

      case 'set-auto-announce-next-song': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            autoAnnounceNextSong: value,
          },
        });

        await interaction.reply('👍 自動宣佈設定已更新');

        break;
      }

      case 'set-default-volume': {
        const value = interaction.options.getInteger('level')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            defaultVolume: value,
          },
        });

        await interaction.reply('👍 音量設定已更新');

        break;
      }

      case 'set-default-queue-page-size': {
        const value = interaction.options.getInteger('page-size')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            defaultQueuePageSize: value,
          },
        });

        await interaction.reply('👍 預設佇列頁面大小已更新');

        break;
      }

      case 'set-reduce-vol-when-voice': {
        const value = interaction.options.getBoolean('value')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            turnDownVolumeWhenPeopleSpeak: value,
          },
        });

        await interaction.reply('👍 降低音量設定已更新');

        break;
      }

      case 'set-reduce-vol-when-voice-target': {
        const value = interaction.options.getInteger('volume')!;

        await prisma.setting.update({
          where: {
            guildId: interaction.guild!.id,
          },
          data: {
            turnDownVolumeWhenPeopleSpeakTarget: value,
          },
        });

        await interaction.reply('👍 降低音量目標設定已更新');

        break;
      }

      case 'get': {
        const embed = new EmbedBuilder().setTitle('設定');

        const config = await getGuildSettings(interaction.guild!.id);

        const settingsToShow = {
          '播放清單限制': config.playlistLimit,
          '佇列清空後等待離開的時間': config.secondsToWaitAfterQueueEmpties === 0
            ? '永不離開'
            : `${config.secondsToWaitAfterQueueEmpties}s`,
          '無聆聽者時自動離開': config.leaveIfNoListeners ? 'yes' : 'no',
          '自動公告下一首歌曲': config.autoAnnounceNextSong ? 'yes' : 'no',
          '佇列新增回應僅對請求者可見': config.autoAnnounceNextSong ? 'yes' : 'no',
          '預設音量': config.defaultVolume,
          '預設佇列頁面大小': config.defaultQueuePageSize,
          '當有人說話時降低音量': config.turnDownVolumeWhenPeopleSpeak ? 'yes' : 'no',
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
        throw new Error('未知子指令');
    }
  }
}
