import { CommandOptions } from "discord-rose";
import { colors } from "../../../structures/extensions/Colors";

export default <CommandOptions>{
  command: 'profile',
  deletable: true,
  interaction: {
    name: 'profile',
    description: 'Check information on your user profile.'
  },
  exec: async (ctx) => {
    if (ctx.isInteraction) ctx.args = [ctx.options]
    const userData = await ctx.worker.db.users.getUser(ctx.author.id)
    const embed = ctx.embed
      .author(`User profile | ${ctx.author.username}`, `https://cdn.discordapp.com/avatars/${ctx.author.id}/${ctx.author.avatar}.gif`)
      .thumbnail(`https://cdn.discordapp.com/avatars/${ctx.worker.user.id}/${ctx.worker.user.avatar}.png`)
      .field(`Reminders`, userData.reminders ? 'Enabled' : 'Disabled', true)
      .field(`Total votes`, `${userData.total_votes}`, true)
      .color(colors.ORANGE)
    if (userData.owner) embed.description(`👑 Owner`)
    ctx.reply({ content: `<@${ctx.author.id}>`, embeds: [embed.render()] }, false, false)
  }
}