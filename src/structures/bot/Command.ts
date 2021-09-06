import { Message, PermissionResolvable } from "discord.js";
import { CommandContext } from "./CommandContext";
export default interface Command {
  messageCommand: {
    command: string
    aliases?: string[]
    permissions?: Array<PermissionResolvable>
    category: string | undefined
    description: string
    exec(ctx: CommandContext): void

  }
  slashCommand?: {

  }
  owner?: boolean
  disabled?: boolean
}