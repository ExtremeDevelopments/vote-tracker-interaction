import { CommandOptions, Snowflake } from "discord-rose";

export default <CommandOptions>{
  command: 'owner',
  ownerOnly: true,
  exec: async (ctx) => {
    const userID = ctx.message.mentions[0]?.id ?? (ctx.args[0] || '').replace(/[<@!>]/g, '') as Snowflake

    const owner = await ctx.worker.db.users.getOwner(userID)
    if (owner) await ctx.worker.db.users.setOwner(userID, false)
    if (!owner) await ctx.worker.db.users.setOwner(userID, true)

    await ctx.send({ content: `${owner ? `Removed users owner permissions.` : `Granted owner permissions`}`})
  }
}
