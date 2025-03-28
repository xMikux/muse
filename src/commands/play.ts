import {AutocompleteInteraction, ChatInputCommandInteraction} from 'discord.js';
import {URL} from 'url';
import {SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from '@discordjs/builders';
import {inject, injectable, optional} from 'inversify';
import Spotify from 'spotify-web-api-node';
import Command from './index.js';
import {TYPES} from '../types.js';
import ThirdParty from '../services/third-party.js';
import getYouTubeAndSpotifySuggestionsFor from '../utils/get-youtube-and-spotify-suggestions-for.js';
import KeyValueCacheProvider from '../services/key-value-cache.js';
import {ONE_HOUR_IN_SECONDS} from '../utils/constants.js';
import AddQueryToQueue from '../services/add-query-to-queue.js';

@injectable()
export default class implements Command {
  public readonly slashCommand: Partial<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder> & Pick<SlashCommandBuilder, 'toJSON'>;

  public requiresVC = true;

  private readonly spotify?: Spotify;
  private readonly cache: KeyValueCacheProvider;
  private readonly addQueryToQueue: AddQueryToQueue;

  constructor(@inject(TYPES.ThirdParty) @optional() thirdParty: ThirdParty, @inject(TYPES.KeyValueCache) cache: KeyValueCacheProvider, @inject(TYPES.Services.AddQueryToQueue) addQueryToQueue: AddQueryToQueue) {
    this.spotify = thirdParty?.spotify;
    this.cache = cache;
    this.addQueryToQueue = addQueryToQueue;

    const queryDescription = thirdParty === undefined
      ? 'YouTube 連結或搜尋關鍵字'
      : 'YouTube 連結、Spotify 連結，或搜尋關鍵字';

    this.slashCommand = new SlashCommandBuilder()
      .setName('play')
      .setDescription('播放歌曲')
      .addStringOption(option => option
        .setName('query')
        .setDescription(queryDescription)
        .setAutocomplete(true)
        .setRequired(true))
      .addBooleanOption(option => option
        .setName('immediate')
        .setDescription('將歌曲加入佇列最前方'))
      .addBooleanOption(option => option
        .setName('shuffle')
        .setDescription('若新增多首歌曲，是否隨機排序'))
      .addBooleanOption(option => option
        .setName('split')
        .setDescription('如果歌曲有章節，是否拆分'))
      .addBooleanOption(option => option
        .setName('skip')
        .setDescription('跳過目前播放的歌曲'));
  }

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query')!;

    await this.addQueryToQueue.addToQueue({
      interaction,
      query: query.trim(),
      addToFrontOfQueue: interaction.options.getBoolean('immediate') ?? false,
      shuffleAdditions: interaction.options.getBoolean('shuffle') ?? false,
      shouldSplitChapters: interaction.options.getBoolean('split') ?? false,
      skipCurrentTrack: interaction.options.getBoolean('skip') ?? false,
    });
  }

  public async handleAutocompleteInteraction(interaction: AutocompleteInteraction): Promise<void> {
    const query = interaction.options.getString('query')?.trim();

    if (!query || query.length === 0) {
      await interaction.respond([]);
      return;
    }

    try {
      // Don't return suggestions for URLs
      // eslint-disable-next-line no-new
      new URL(query);
      await interaction.respond([]);
      return;
    } catch {}

    const suggestions = await this.cache.wrap(
      getYouTubeAndSpotifySuggestionsFor,
      query,
      this.spotify,
      10,
      {
        expiresIn: ONE_HOUR_IN_SECONDS,
        key: `autocomplete:${query}`,
      });

    await interaction.respond(suggestions);
  }
}
