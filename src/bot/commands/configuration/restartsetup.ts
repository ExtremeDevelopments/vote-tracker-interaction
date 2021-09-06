import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import Command from "../../../structures/bot/Command";

export default {
  messageCommand: {
    command: 'restartsetup',
    aliases: ['restart'],
    category: 'Configuration',
    description: 'Restart the setup of your server!',
    permissions: ['MANAGE_GUILD'],
    exec: async (ctx) => {
      if (!ctx.guild) return
      const guild = await ctx.client.db.guilds.getGuild(ctx.guild.id)
      if (!guild.auth_code) return ctx.respond(`Your server is not yet setup!`, { type: 'NO' })
      const message = await ctx.send({
        embeds: [
          new MessageEmbed()
            .setTitle(`⚠️WARNING`)
            .addField(`Confirmation`, `Are you sure that you want to do this? Your guild's data will be deleted. This action is irreversible.`)
            .setColor(ctx.colors.RED)
        ],
        components: [
          new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setCustomId('yes')
                .setLabel('Reset')
                .setStyle('PRIMARY'),
              new MessageButton()
                .setCustomId('no')
                .setLabel('cancel')
                .setStyle('DANGER')
            )
        ]
      })
      message.awaitMessageComponent({ componentType: 'BUTTON', time: 15000 })
        .then(i => {
          if (i.customId === 'yes') {
            guild.auth_code = null;
            guild.vote = {
              channel_id: null,
              message: guild.vote.message,
              role: null
            }
            ctx.client.db.guilds.updateGuild(guild)
            ctx.respond('Server data reset.', { type: 'YES' })
          }
          if (i.customId === 'no') {
            ctx.respond('Server reset cancelled.')
          }
        })

    }
  }
} as Command