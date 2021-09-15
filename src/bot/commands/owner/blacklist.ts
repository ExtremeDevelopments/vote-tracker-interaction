import { CommandOptions, Snowflake } from "discord-rose";
export default <CommandOptions>{
  command: 'owner',
  ownerOnly: true,
  exec: async (ctx) => {
    const userID = ctx.message.mentions[0]?.id ?? (ctx.args[0] || '').replace(/[<@!>]/g, '') as Snowflake

    const blacklist = await ctx.worker.db.users.getBlacklisted(userID)
    if (blacklist) await ctx.worker.db.users.setBlacklisted(userID, false)
    if (!blacklist) await ctx.worker.db.users.setBlacklisted(userID, true)
  }
}