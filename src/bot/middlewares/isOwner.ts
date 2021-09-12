import { CommandContext } from "discord-rose"

export default () => {
  return async (ctx: CommandContext) => {
    if(!ctx.command.ownerOnly) return true
    
    return await ctx.worker.db.users.getOwner(ctx.author.id)
  }
}