import { Client, ClientOptions, Collection } from 'discord.js'
import { readdirSync } from 'fs'
import { isAbsolute, resolve } from 'path';
import { Database } from '../database';
import Master from '../structures/Master';
import { CommandContext } from './CommandContext';
export default class VoteTracker extends Client {
  master: Master
  db: Database
  commands: Collection<string, CommandContext> = new Collection()
  constructor(options: ClientOptions, master: Master) {
    super(options);
    this.master = master
    this.db = master.db
  }

  construct(): void {
    this.loadEvents('./events')
    this.loadCommands('./commands')
    this.on('ready', () => {
      this.user?.setActivity('Votes go brrrrrr')
    })
    this.login('')
  }

  /**
   * Load many commands
   * @param dir Directory to search
   * @example
   * worker.loadEvents(path.resolve(__dirname, 'events/'))
   */
  public loadEvents(dir: string): void {
    const files = readdirSync(dir, { withFileTypes: true })
    files.forEach(file => {
      const filePath = dir + '/' + file.name
      if (file.isDirectory()) return this.loadEvents(filePath)
      if (!file.name.endsWith('.js')) return

      const event: (client: VoteTracker, ...data: any[]) => {} = require(filePath).default
      // @ts-expect-error
      this.on(file.name.slice(0, -3) as any, event.bind(null, this))

      delete require.cache[require.resolve(filePath)]
    })
  }
  public loadCommands(dir: string): void {
    if (!isAbsolute(dir)) dir = resolve(process.cwd(), dir)

    const files = readdirSync(dir, { withFileTypes: true })

    files.forEach(file => {
      if (file.name.endsWith('.js')) return

      delete require.cache[require.resolve(resolve(dir, file.name))]

      let command = require(resolve(dir, file.name))

      if (!command) return

      if (command.default) command = command.default

      this.commands.set(command.data.name, command)
    })
  }
}
