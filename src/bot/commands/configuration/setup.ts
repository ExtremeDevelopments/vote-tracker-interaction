import { MessageEmbed } from "discord.js";
import Command from "../../../structures/bot/Command";

export default {
  messageCommand: {
    command: 'setup',
    aliases: ['start'],
    category: 'Configuration',
    description: 'Setup your server with me!',
    permissions: ['MANAGE_GUILD'],
    exec: async (ctx) => {
      if (!ctx.guild) return
      const guild = await ctx.client.db.guilds.getGuild(ctx.guild?.id)
      if (guild.auth_code !== null) return ctx.respond(`This server is already setup!`, {
        type: 'NO'
      })
      await ctx.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`Begin setup!`)
            .addField(`To start`, `Provide the channel you would like all votes to be sent to!`)
            .setFooter(`Vote Tracker+`, ctx.client.user?.displayAvatarURL())
        ]
      })
      const collector = ctx.channel.createMessageCollector({
        filter: (m => m.author.id === ctx.author.id),
        time: 60000,
      })
      collector.on('collect', async (msg) => {
        const channel = msg.mentions.channels.first() ||
          ctx.client.channels.cache.get(msg.content) ||
          await ctx.client.channels.fetch(msg.content)
        if (!channel) ctx.respond('This is not a valid channel!')
        if (channel) {
          const authCode = ctx.client.makeAuthCode(8)
          guild.auth_code = authCode
          ctx.client.db.guilds.updateGuild(guild)
          const embed = new MessageEmbed()
            .setTitle(`Almost there!`)
            .setDescription(`I will now send vote messages to <#${channel.id}>!

          **Now the hard part...**
          Go to the [top.gg servers](https://top.gg/servers/me) and navigate to **this server**. If the server is already registered, you can [click this link!](https://top.gg/servers/${ctx.guild?.id})
          Once you have located your servers page, proceed to the **edit page** found [here!](https://top.gg/servers/${ctx.guild?.id}/edit)
          Scroll **ALL** the way down the edit page.

          Select the **Server Webhooks -- URL** fill in. Put in the URL: https://api.servervoting.tk/send/server

          Proceed to select the **Authorization** fill in and put in the code ||${authCode}||. **Make sure to keep this private as this is your only access to our voting API and if it is revealed it will be reset/deleted.**

          Once you have done this, you can run a **Test Webhook** after saving and the user who tested it will receive a dm from me stating that is has successfully worked!

          If you have any questions or concerns, please join our [Support Server!](https://discord.gg/XdZexqk4HD)`)
            .setFooter(`Vote Tracker`, ctx.client.user?.displayAvatarURL())
            .setColor(ctx.colors.ORANGE)
          ctx.send({ embeds: [embed] })
        }
      })
      collector.on('end', (collected) => { })
      
    }
  }
} as Command