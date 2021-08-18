import { ApplicationCommandOptionData, Interaction } from 'discord.js'
import VoteTracker from './VoteTracker'

export interface CommandContext {
  name: string
  description: string
  options: ApplicationCommandOptionData[]
  defaultPermission: boolean
  exec: (client: VoteTracker, interaction: Interaction) => any
}
