import { Cache } from "@jpbberry/cache";
import { SingleWorker } from "discord-rose";
import { readdirSync } from "fs";
import fetch from "node-fetch";
import { Database } from "../database";
import { WorkerAPI } from "../API/workerAPI";
export class VTWorker extends SingleWorker {
  handlers = {
    interactions: null,
    votes: null
  }
  db = new Database('mongodb://localhost:27017/votetracker')
  timers = new Cache<string, NodeJS.Timeout | null>(15 * 60 * 1000)
  rest = new WorkerAPI(this)
  public loadMiddlewares(dir: string): any {

    fetch('http://localhost:2312/vote', {
      method: 'POST',
      body: JSON.stringify({ guild: '707479016696971275', user: '277183033344524288', type: 'test' }),
      headers: { 'Content-Type': 'application/json'}
    })
    const files = readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const filePath = dir + '/' + file.name
      if (file.isDirectory()) return this.loadMiddlewares(filePath)
      if (!file.name.endsWith('.js')) return

      const required = require(filePath)
      const middleware = required.default ? required.default : required
      this.commands.middleware(middleware())

      delete require.cache[require.resolve(filePath)]
    }
  }
}