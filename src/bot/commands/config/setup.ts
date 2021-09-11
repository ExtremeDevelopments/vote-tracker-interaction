import { ApplicationCommandOptionType } from "discord-api-types";
import { CommandOptions } from "discord-rose";
import { colors } from "../../../structures/extensions/Colors";
import { createID } from "../../../utils";

export default <CommandOptions>{
  command: 'setup',
  interaction: {
    name: 'setup',
    description: 'setup your server!',
    options: [
      {
        name: 'channel',
        description: 'Channel to send votes to.',
        type: ApplicationCommandOptionType.Channel,
        required: true
      }

    ]
  },
  exec: async (ctx) => {
    if (!ctx.guild) return
    if (ctx.isInteraction) ctx.args = [ctx.options]
    if (ctx.options) {
      const guildData = await ctx.worker.db.guilds.getGuild(ctx.guild.id)
      if (guildData.auth_code !== null) return ctx.reply({ content: 'This server is already setup!' }, true)

      const authCode = createID(await ctx.worker.db.guilds.getAllCodes(), 8)
      guildData.auth_code = authCode
      ctx.worker.db.guilds.updateGuild(guildData)

      const embed = ctx.embed
        .title('Almost there!')
        .description(`I will now send vote messages to <#${ctx.options.channel}>!

      **Now the hard part...**
      Go to the [top.gg servers](https://top.gg/servers/me) and navigate to **this server**. If the server is already registered, you can [click this link!](https://top.gg/servers/${ctx.guild?.id})
      Once you have located your servers page, proceed to the **edit page** found [here!](https://top.gg/servers/${ctx.guild?.id}/edit)
      Scroll **ALL** the way down the edit page.

      Select the **Server Webhooks -- URL** fill in. Put in the URL: https://api.servervoting.tk/send/server

      Proceed to select the **Authorization** fill in and put in the code ||${authCode}||. **Make sure to keep this private as this is your only access to our voting API and if it is revealed it will be reset/deleted.**

      Once you have done this, you can run a **Test Webhook** after saving and the user who tested it will receive a dm from me stating that is has successfully worked!

      If you have any questions or concerns, please join our [Support Server!](https://discord.gg/XdZexqk4HD)`)
        .footer(`Vote Tracker`)
        .color(colors.ORANGE)
      ctx.reply({ embeds: [embed.render()] }, true)
    }
  }
}