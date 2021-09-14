import { CommandContext } from "discord-rose"

export default () => {
  return async (ctx: CommandContext) => {

    if (ctx.command.interactionOnly && !ctx.isInteraction) return false

    return true
  }
}