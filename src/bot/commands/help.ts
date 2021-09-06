import Command from "../../structures/bot/Command";
import { MessageEmbed } from "discord.js";
export default {
  messageCommand: {
    command: 'help',
    category: 'Information',
    description: 'Receive help with the bot',
    exec: async (ctx) => {
      const prefix = ctx.prefix

      const cmd = ctx.args[0]
      if (!ctx.client.commandHandler.commands) return await ctx.error('I have no commands loaded...')

      if (cmd) {
        const command = ctx.client.commandHandler.commands.find(e => e.messageCommand.command === cmd)

        if (command) {
          ctx.send({
            embeds: [
              new MessageEmbed()
                .setAuthor(ctx.author.username + ' | ' + ctx.command.messageCommand.command, ctx.client.user?.displayAvatarURL())
                .setDescription(`\`Command\`: ${command.messageCommand.command}\n\`Description\`: ${command.messageCommand.description ?? 'None'}`)
                .setTimestamp()
            ]
          })
        } else {
          return ctx.error(`Command \`${cmd}\` unavailable or not found.`)
        }
      } else {
        let user: any = await ctx.client.db.users.getUser(ctx.message.author.id)
        if (!user) user = { owner: false }
        // @ts-expect-error
        const categories: string[] = ctx.client.commandHandler.commands.reduce((a, b) => a.includes(b.messageCommand.category) ? a : a.concat([b.messageCommand.category]), [])

        const embed = new MessageEmbed()
          .setAuthor(ctx.author.username + ' | ' + ctx.command.messageCommand.command, ctx.client.user?.displayAvatarURL())
          .setTitle(`Commands`)
          .setTimestamp()

        categories.forEach((cat) => {
          if (!cat) return
          if (cat.toLowerCase() === 'owner' && !user.owner) return
          if (!ctx.client.commandHandler.commands) return
          const desc = ctx.client.commandHandler.commands
            .filter(x => x.messageCommand.category === cat && !x.disabled)
            .map(_cmd => `\`${ctx.prefix}${_cmd.messageCommand.command}\`: ${_cmd.messageCommand.description ?? 'None'}`)
            .join('\n')
          if (!desc) return

          embed.addField(cat.charAt(0).toUpperCase() + cat.substr(1), desc)
        })
        ctx.send({ embeds: [embed] })
      }
    }
  }
} as Command