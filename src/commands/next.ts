import {injectable} from 'inversify';
import Skip from './skip.js';
import {SlashCommandBuilder} from '@discordjs/builders';

@injectable()
export default class extends Skip {
  public readonly slashCommand = new SlashCommandBuilder()
    .setName('next')
    .setDescription('跳到下一首歌曲');
}
