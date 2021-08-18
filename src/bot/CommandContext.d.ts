import { ApplicationCommandOptionData, CommandInteraction } from 'discord.js'
import VoteTracker from './VoteTracker'
import { SlashCommandBuilder } from '@discordjs/builders'
export interface CommandContext {
  data: SlashCommandBuilder
  options: Array<ApplicationCommandOptionData>
  defaultPermission: boolean
  data: SlashCommandBuilder
  exec: (client: VoteTracker, interaction: CommandInteraction) => any
}
