import { SingleWorker } from "discord-rose";
import { readdirSync } from "fs";
import { Database } from "../database";
export class VTWorker extends SingleWorker {
  handlers = {
    interactions: null,
    votes: null
  }
  db = new Database('mongodb://localhost:27017/votetracker', this)
  
  public loadMiddlewares (dir: string): any {
    const files = readdirSync(dir, { withFileTypes: true })
    for(const file of files) {
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