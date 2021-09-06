import { Guild, Message, MessageOptions, User, MessageEmbed, GuildMember } from "discord.js"
import { CommandError } from "../handlers/CommandHandler"
import Command from "./Command"
import VT from "./VoteTracker"
import { colors } from "../modules/colors"

interface RespondOptions {
  mention?: boolean
  embed?: boolean
  reply?: boolean
  error?: boolean
  color?: number
  type?: keyof typeof responseTypes
}
export const responseTypes = {
  NO: '',
  YES: '',
  ERROR: '',
  NONE: ''
}

export class CommandContext {
  public args: any[]
  public client: VT
  public message: Message
  public command: Command
  public prefix: string | string[] | undefined
  public ran: string
  colors = colors
  constructor(opts: { client: VT, message: Message, command: Command, prefix: string | string[] | undefined, ran: string, args: string[] }) {
    this.client = opts.client
    this.message = opts.message
    this.command = opts.command
    this.prefix = opts.prefix
    this.ran = opts.ran
    this.args = opts.args
  }
  get author(): User {
    return this.message.author
  }
  get member(): GuildMember | null {
    return this.message.member
  }

  get guild(): Guild | null {
    return this.message.guild
  }

  get channel() {
    return this.message.channel
  }

  get me() {
    return this.guild?.me
  }
  async send(data: MessageOptions) {
    return this.message.channel.send(data)
  }

  async error(message: string | Promise<string>): Promise<void> {
    const error = new CommandError(await message)

    error.nonFatal = true

    this.client.commandHandler.error(this, error)
  }

  async respond(message: string, options: RespondOptions = {}): Promise<Message | null> {
    options.embed = options.embed || true

    if (!options.embed) {
      const response = await this.send({ content: message })
        .catch(() => undefined)

      return response ?? null
    }
    options.type = options.type || 'NONE'
    options.error = options.error || false
    options.reply = options.reply || false
    options.mention = options.mention || false

    options.color = options.color ??
      (options.type === 'ERROR'
        ? this.colors.RED
        : undefined) ??
      (options.type === 'YES'
        ? this.colors.GREEN
        : undefined
      ) ??
      (options.error
        ? this.colors.RED
        : this.colors.GREEN)

    const response = new MessageEmbed()
      .setDescription(`${responseTypes[options.type ?? 'NONE']}${message}`)
      .setColor(options.color)

    const sent = await this.send({ embeds: [response] })
    return sent ?? null
  }
}