import { MessageEmbed } from 'discord.js'
import util from 'util'
import Command from '../../../structures/bot/Command'
function clean(text: string): string {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}

export default {
  messageCommand: {
    command: 'eval',
    description: 'Evaluate code',
    category: 'Owner',
    aliases: ['ev'],
    exec: async (ctx) => {
      const client = ctx.client
      try {
        const code = ctx.args.join(' ')
        let evaled: string | string[] = eval(code)

        if (evaled instanceof Promise) evaled = await evaled

        if (typeof evaled !== 'string') { evaled = util.inspect(evaled) }

        await ctx.send({
          embeds: [
            new MessageEmbed()
              .setColor(ctx.colors.GREEN)
              .setTitle(`Eval successful!`)
              .setDescription(`\`\`\`xl\n${evaled}\`\`\``)
          ]
        })
      } catch (err) {
        ctx.send({
          embeds: [
            new MessageEmbed()
              .setColor(ctx.colors.RED)
              .setTitle(`Eval failed`)
              .setDescription(`\`\`\`xl\n${clean(err as string)}\`\`\``)
          ]
        }).catch(() => { })
      }

    }
  },
  owner: true
} as Command