import { VTWorker } from "../client/VTWorker"
import { influx as config } from '../../config.json'
import { InfluxDB, Point } from "@influxdata/influxdb-client"

export default class InfluxManager {
  client = new InfluxDB({
    url: config.url,
    token: config.token
  })
  eventCounter: Array<Counter> = []
  dbCounter: Array<Counter> = []
  commandCounter: Array<Counter> = []
  constructor(private readonly worker: VTWorker | undefined) {
    if (this.worker !== undefined) {
      this.worker.on('READY', () => {
        setInterval(() => {
          this.sendBaseStats()
        }, 30e3)
      })
      this.worker.on('*', data => {
        this.handleEvent(data)
      })
    }
    this.startTimers()
  }
  sendStats(name: string, count: number, type: string): void {
    const writeAPI = this.client.getWriteApi(config.org, config.bucket)
      .useDefaultTags({ host: name })
    try {
      writeAPI.writePoint(new Point(type).intField("count", count))
      writeAPI.close()
    } catch (e) { }
  }
  sendBaseStats(): void {
    if (!this.worker) return
    const writeAPI = this.client.getWriteApi(config.org, config.bucket)
      .useDefaultTags({ host: `worker` })
    try {
      writeAPI.writePoints([
        this.getMemoryStats() as Point,
        new Point('servers').intField('count', this.worker.guilds.size),
        new Point('ping').intField('count', this.worker.shards.first()?.ping),
        new Point('uptime').intField('length', Math.floor(process.uptime() / 60))
      ])
      writeAPI.close()
    } catch (e) { }
  }
  getMemoryStats(): Point | null {
    if (!this.worker) return null
    return new Point('memory')
      .intField('rss', this.worker.mem.rss)
      .intField('heap-used', this.worker.mem.heapUsed)
      .intField('heap-total', this.worker.mem.heapTotal)
      .intField('array-buffers', this.worker.mem.arrayBuffers)
      .intField('external', this.worker.mem.external)
  }
  startTimers(): void {
    setInterval(() => {
      this.eventCounter.forEach(e => {
        this.sendStats(e.name, e.count, 'events')
        e.count = 0
      })
      this.dbCounter.forEach(e => {
        this.sendStats(e.name, e.count, 'database')
        e.count = 0
      })
      this.commandCounter.forEach(e => {
        this.sendStats(e.name, e.count, 'commands')
        e.count = 0
      })
    }, 10000)
  }
  private handleEvent(data: any): void {
    if (data.t === null) return
    const found = this.eventCounter.find(e => e.name === data.t)
    if (!found) this.eventCounter.push({ name: data.t, count: 1 })
    if (found) found.count++
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
export interface Counter {
  name: string
  count: number
}