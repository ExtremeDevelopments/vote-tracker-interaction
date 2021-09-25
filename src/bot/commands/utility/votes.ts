import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandOptions } from "discord-rose";
import { colors } from "../../../structures/extensions/Colors";

export default <CommandOptions>{
  command: 'votes',
  deletable: true,
  interaction: {
    name: 'votes',
    description: 'Add, remove, or check votes of a user!',
    options: [
      {
        name: 'user',
        description: 'User to check for.',
        type: ApplicationCommandOptionType.User,
        required: true
      }
    ]
  },
  exec: async (ctx) => {
    if (!ctx.guild) return
    if (ctx.isInteraction) ctx.args = [ctx.options]
    const user = ctx.options.user || ctx.author.id
    const userData = await ctx.worker.db.users.getUserVotes(user, ctx.guild.id)
    const foundUser = ctx.worker.users.get(user)
      ?? await ctx.worker.api.users.get(user).catch(e => null)
    const embed = ctx.embed
      .title(`${foundUser ? foundUser.username : `User`}'s vote information.`)
      .description(`**Total votes:** ${userData.total_votes}
      **Last vote:** ${userData.last_vote === null ? `Never` : `<t:${Math.floor(userData.last_vote / 1000)}:R>`}
      `)
      .color(colors.ORANGE)
    ctx.reply({ embeds: [embed.render()] }, false, false)
  }
}