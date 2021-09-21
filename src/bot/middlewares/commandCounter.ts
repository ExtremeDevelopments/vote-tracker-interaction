import { CommandContext } from "discord-rose"

export default () => {
  return async (ctx: CommandContext) => {
    ctx.worker.managers.influx.commandRan(ctx.command.command as string)
    return true
  }
}