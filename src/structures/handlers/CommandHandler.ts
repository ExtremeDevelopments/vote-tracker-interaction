import { Collection, Message, MessageEmbed } from "discord.js";
import { readdirSync } from "fs";
import { isAbsolute, resolve } from "path";
import Command from "../bot/Command";
import { CommandContext } from "../bot/CommandContext";
import VT from "../bot/VoteTracker";
export type MWF = (ctx: CommandContext) => boolean | Promise<boolean>
export class CommandError extends Error {
  nonFatal?: boolean
}
export default class CommandHandler {
  client: VT
  added: boolean
  commands: Collection<string, Command> | undefined;
  middlewares: MWF[]
  constructor(client: VT) {
    this.client = client
    this.added = false
    this.middlewares = []
  }
  load(dir: string) {
    if (isAbsolute(dir)) dir = resolve(process.cwd(), dir)
    const files = readdirSync(dir, { withFileTypes: true })
    files.forEach(file => {
      if (file.isDirectory()) return this.load(resolve(dir, file.name))
      if (!file.name.endsWith('.js')) return

      delete require.cache[require.resolve(resolve(dir, file.name))]

      let command = require(resolve(dir, file.name))
      if (!command) return
      if (command.default) command = command.default

      this.add(command)
    })
  }
  add(command: Command): this {
    if (!command.messageCommand) return this
    var a;
    if (!this.added) {
      this.added = true
      this.commands = new Collection()
      this.client.on('messageCreate', (message) => {
        this.exec(message).catch(() => { })
      })
    }
    (a = this.commands) === null || a === void 0 ? void 0 : a.set(command.messageCommand.command, Object.assign(command))
    return this
  }

  find(command: string): Command | undefined {
    return this.commands?.find(x => x.messageCommand.command === command || x.messageCommand.aliases?.includes(command) as boolean)
  }

  private async exec(message: Message): Promise<void> {
    if (!message.content || message.author.bot) return

    let prefix: string | string[] | undefined = 'v!'
    let getPrefix = async () => {
      const id = message.guild?.id
      if (!id) return 'v!'
      return await this.client.db.guilds.getPrefix(id)
    }
    prefix = await getPrefix()
    if (!Array.isArray(prefix)) prefix = [prefix]

    prefix.push(`<@${this.client.user?.id}>`)

    const content = message.content.toLowerCase()
    prefix = prefix.find(x => content.startsWith(x))
    if(!prefix) return

    const args = message.content.slice(prefix.length).split(/\s/)
    const command = args.shift() ?? ''

    const cmd = this.find(command)
    if (!cmd) return
    const ctx = new CommandContext({
      client: this.client,
      message,
      command: cmd,
      prefix,
      args,
      ran: cmd.messageCommand.command
    })
    this.client.influx.commandRan(ctx.command.messageCommand.command)
    try {
      for (const middleware of this.middlewares) {
        try {
          if (await middleware(ctx) !== true) return
        } catch (err: any) {
          
          err.nonFatal = true
          throw err
        }
      }
      await cmd.messageCommand.exec(ctx)
    } catch (err) {
      
      this.error(ctx, err as CommandError)
    }
  }
  error(ctx: CommandContext, err: CommandError) {
    console.log(err)
    const embed = new MessageEmbed()
      .setColor(0xFF0000)
      .setTitle('Error!')
      .setDescription(err.nonFatal ? err.message : `Error: ${err.message}`)
    try {
      ctx.send({ embeds: [embed] })
    } catch (e) { }
  }
  addMiddleware(fn: MWF): this {
    this.middlewares.push(fn)

    return this
  }
}