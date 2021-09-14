import { SingleWorker } from "discord-rose";
import { readdirSync } from "fs";
import { Database } from "../database";
import { WorkerAPI } from "../API/WorkerAPI";
import InfluxHandler from "../managers/InfluxManager";
import { ButtonManager } from "../managers/ButtonManager";
export class VTWorker extends SingleWorker {
  handlers = {
    interactions: null,
    votes: null
  }
  db = new Database('mongodb://localhost:27017/votetracker')
  rest = new WorkerAPI(this)
  influx = new InfluxHandler(this)
  buttons = new ButtonManager(this)
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
  get mem(): NodeJS.MemoryUsage {
    return Object.entries(process.memoryUsage()).reduce<any>((T, [K, V]) => {
      T[K] = (V / 1024 ** 2).toFixed(1) + 'MB'
      return T
    }, {})
  }
}