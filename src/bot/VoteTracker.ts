import { Client, ClientOptions } from 'discord.js'
import { readdirSync } from 'fs'
import { Database } from '../database';
import Master from '../structures/Master';
export default class VoteTracker extends Client {
  master: Master;
  db: Database
  constructor(options: ClientOptions, master: Master) {
    super(options);
    this.master = master
    this.db = master.db
  }

  construct(): void {
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
}
