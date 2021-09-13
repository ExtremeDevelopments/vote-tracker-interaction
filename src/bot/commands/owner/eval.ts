import { CommandOptions } from "discord-rose";
import util from "util"
import { colors } from "../../../structures/extensions/Colors";
function clean (text: string): string {
  if (typeof (text) === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)) } else { return text }
}
export default <CommandOptions>{
  command: 'eval',
  ownerOnly: true,
  exec: async (ctx) => {
    const worker = ctx.worker

    try {
      const code = ctx.args.join(' ')
      let evaled: string | string[] = eval(code)

      if (evaled instanceof Promise) evaled = await evaled

      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      if (typeof evaled !== 'string') { evaled = util.inspect(evaled) }

      await ctx.embed
        .color(colors.GREEN)
        .title('Eval Successful')
        .description(`\`\`\`xl\n${evaled}\`\`\``)
        .send()
    } catch (err) {
      ctx.embed
        .color(colors.RED)
        .title('Eval Unsuccessful')
        .description(`\`\`\`xl\n${clean(err as string)}\`\`\``)
        .send()
        .catch(() => { })
    }
  }
}