import { Cache } from "@jpbberry/cache";
import { SingleWorker } from "discord-rose";
import { readdirSync } from "fs";
import fetch from "node-fetch";
import { Database } from "../database";
import { WorkerAPI } from "../API/WorkerAPI";
export class VTWorker extends SingleWorker {
  handlers = {
    interactions: null,
    votes: null
  }
  db = new Database('mongodb://localhost:27017/votetracker')
  rest = new WorkerAPI(this)
  public loadMiddlewares(dir: string): any {
    const files = readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      const filePath = dir + '/' + file.name
      if (file.isDirectory()) {
        this.loadMiddlewares(filePath)
        continue
      }
      if (!file.name.endsWith('.js')) continue

      const required = require(filePath)
      const middleware = required.default ? required.default : required

      this.commands.middleware(middleware())

      delete require.cache[require.resolve(filePath)]
    }
  }
}