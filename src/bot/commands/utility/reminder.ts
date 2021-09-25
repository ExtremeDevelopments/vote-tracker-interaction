import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandOptions } from "discord-rose";
import { colors } from "../../../structures/extensions/Colors";

export default <CommandOptions>{
  command: 'reminders',
  interaction: {
    name: 'reminders',
    description: 'Enable or disable vote reminders!',
    options: [
      {
        name: 'enable',
        description: 'Enable vote reminders',
        type: ApplicationCommandOptionType.Subcommand
      },
      {
        name: 'disable',
        description: 'Disable vote reminders',
        type: ApplicationCommandOptionType.Subcommand
      }
    ]
  },
  exec: async (ctx) => {
    if (!ctx.guild) return
    if (ctx.isInteraction) ctx.args = [ctx.options]
    const user = await ctx.worker.db.users.getUser(ctx.author.id)
    if (ctx.options.enable) {
      user.reminders = true
      await ctx.worker.db.users.updateUser(user)
      ctx.reply({ embeds: [{ description: 'Reminder option enabled!', color: colors.ORANGE }] }, false, true)
    }
    if (ctx.options.disable) {
      user.reminders = false
      await ctx.worker.db.users.updateUser(user)
      ctx.reply({ embeds: [{ description: 'Reminder option disabled!', color: colors.ORANGE }] }, false, true)
    }
  }
}