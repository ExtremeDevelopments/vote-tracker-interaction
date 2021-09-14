import { CommandContext } from "discord-rose";
export default () => {
  return async (ctx: CommandContext) => {
    const found = await ctx.worker.db.users.getBlacklisted(ctx.author.id)
    
    if(found) return false
    if(!found) return true
  }
}