import { Client, ClientOptions } from 'discord.js'
import { Database } from '../../database'
import { resolve } from 'path'
import config from '../../config.json'
import { green } from 'chalk'
import Influx from '../Influx'
import CommandHandler from '../handlers/CommandHandler'
import { API } from '../../api'
import { colors } from '../modules/colors'
export default class VoteTracker extends Client {
  db: Database
  influx: Influx
  commandHandler: CommandHandler
  voteAPI: API
  colors = colors
  constructor(opts: ClientOptions) {
    super(opts);
    this.db = new Database('mongodb://localhost:27017/votetracker', this)
    this.commandHandler = new CommandHandler(this)
    this.influx = new Influx(this, 'Vote Tracker')
    this.voteAPI = new API({ port: 3000 }, this)
  }
  start(): void {
    this.commandHandler.load(resolve(__dirname, '../../commands'))
    this.on('ready', () => {
      console.log(green(`VT online!`))
      this.influx.sendBaseStats()
      setInterval(() => this.influx.sendBaseStats(), 30e3)
    })

    this.login(config.bot.token)
  }
  get mem(): NodeJS.MemoryUsage {
    return Object.entries(process.memoryUsage()).reduce<any>((T, [K, V]) => {
      T[K] = (V / 1024 ** 2).toFixed(1) + 'MB'
      return T
    }, {})
  }
  makeAuthCode(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}