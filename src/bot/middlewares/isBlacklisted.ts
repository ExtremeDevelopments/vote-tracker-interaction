import { CommandContext } from "discord-rose";
export default () => {
  return async (ctx: CommandContext) => {
    return await ctx.worker.db.users.getBlacklisted(ctx.author.id)
  }
}