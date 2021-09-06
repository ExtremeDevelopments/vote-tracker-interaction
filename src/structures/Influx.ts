import { InfluxDB, Point } from "@influxdata/influxdb-client";
import VT from "./bot/VoteTracker";
import config from '../config.json'
export default class Influx {
  influx = new InfluxDB({
    url: config.influx.url,
    token: config.influx.token
  })
  eventCounter: Array<Counter> = []
  dbCounter: Array<Counter> = []
  commandCounter: Array<Counter> = []
  constructor(private readonly client: VT, name: string) {
    this.client.on('raw', data => {
      this.handleEvent(data)
    })
    this.startTimers()
  }
  handleEvent(data: any): void {
    if (data.t === null) return
    const found = this.eventCounter.find(e => e.name === data.t)
    if (!found) this.eventCounter.push({ name: data.t, count: 1 })
    if (found) found.count++
  }
  sendEvent(eventName: string, eventCount: number): void {
    const writeAPI = this.influx.getWriteApi(config.influx.org, config.influx.bucket)
      .useDefaultTags({ host: eventName })

    writeAPI.writePoint(new Point("event").intField("count", eventCount))
    writeAPI.close().then(() => { })
      .catch((err) => console.log(err))
  }
  sendDBStats(name: string, count: number): void {
    const writeAPI = this.influx.getWriteApi(config.influx.org, config.influx.bucket)
      .useDefaultTags({ host: name })

    writeAPI.writePoint(new Point("db").intField("count", count))
    writeAPI.close().then(() => { })
      .catch((err) => console.log(err))
  }
  sendCommandStats(name: string, count: number): void {
    const writeAPI = this.influx.getWriteApi(config.influx.org, config.influx.bucket)
      .useDefaultTags({ host: name })

    writeAPI.writePoint(new Point("command").intField("count", count))
    writeAPI.close().then(() => { })
      .catch((err) => console.log(err))
  }
  getMemoryStats(): Point {
    return new Point('memory')
      .intField('rss', this.client.mem.rss)
      .intField('heap-used', this.client.mem.heapUsed)
      .intField('heap-total', this.client.mem.heapTotal)
      .intField('array-buffers', this.client.mem.arrayBuffers)
      .intField('external', this.client.mem.external)
  }
  sendBaseStats(): void {
    const writeAPI = this.influx.getWriteApi(config.influx.org, config.influx.bucket)
      .useDefaultTags({ host: "shard-0" })
    writeAPI.writePoints([
      this.getMemoryStats(),
      new Point('servers').intField('amount', this.client.guilds.cache.size),
      new Point('ping').intField('number', this.client.ws.ping),
      new Point('uptime').intField('number', Math.floor(process.uptime() / 60))
    ])
    writeAPI.close().then(() => { })
      .catch((err) => console.log(err))
  }
  startTimers(): void {
    setInterval(() => {
      this.eventCounter.forEach(e => {
        this.sendEvent(e.name, e.count)
        e.count = 0
      })
      this.dbCounter.forEach(e => {
        this.sendDBStats(e.name, e.count)
        e.count = 0
      })
      this.commandCounter.forEach(e => {
        this.sendCommandStats(e.name, e.count)
        e.count = 0
      })
    }, 5000)
  }
  addDBCount(name: string) {
    const found = this.dbCounter.find(e => e.name === name)
    if (!found) this.dbCounter.push({ name, count: 1 })
    if (found) found.count++
  }
  commandRan(name: string) {
    const found = this.commandCounter.find(e => e.name === name)
    if (!found) this.commandCounter.push({ name, count: 1 })
    if (found) found.count++
  }
}
interface Counter {
  name: string
  count: number
}