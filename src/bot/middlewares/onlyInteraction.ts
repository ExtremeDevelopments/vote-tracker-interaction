import { CommandContext } from "discord-rose"

export default () => {
  return async (ctx: CommandContext) => {
    return !(ctx.command.interactionOnly && !ctx.isInteraction);
  }
}
