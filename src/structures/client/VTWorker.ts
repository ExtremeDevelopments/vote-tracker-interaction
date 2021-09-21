import { SingleWorker } from "discord-rose";
import { readdirSync } from "fs";
import { Database } from "../database";
import { WorkerAPI } from "./RESTWorker";
import InfluxManager from "../managers/Influx";
import { ButtonManager } from "../managers/Buttons";

export class VTWorker extends SingleWorker {
  db = new Database('mongodb://localhost:27017/votetracker')
  rest = new WorkerAPI(this)

  managers = {
    influx: new InfluxManager(this),
    buttons: new ButtonManager(this)
  }

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
