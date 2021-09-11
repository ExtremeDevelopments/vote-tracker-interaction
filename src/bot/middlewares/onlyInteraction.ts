import { CommandContext } from "discord-rose"

export default () => {
  return async (ctx: CommandContext) => {
    if (ctx.command.onlyInteractions && !ctx.isInteraction) return false
    return true
  }
}