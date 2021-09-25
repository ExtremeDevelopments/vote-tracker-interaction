import { CommandContext } from "discord-rose"

export default () => {
  return async (ctx: CommandContext) => {

    if (ctx.command.interactionOnly && !ctx.isInteraction) {
      ctx.reply(`This command is only usable via slash commands!`)
      return false
    }

    return true
  }
}