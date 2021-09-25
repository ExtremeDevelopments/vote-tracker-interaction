import { Cache } from "@jpbberry/cache"
import fetch from 'node-fetch'
import { Database } from "../database"
import express, { Express } from 'express'
import { LoadRoutes } from "@jpbberry/load-routes"
import { resolve } from "path"
export class RESTManager {
  db = new Database('mongodb://localhost:27017/votetracker')
  timers = new Cache<string, NodeJS.Timeout>(15 * 60 * 1000)
  notsent: Array<any> = []
  api: Express
  constructor(public readonly port: number) {
    this.api = express()
    this.api.use(express.json())
    this.api.use(express.urlencoded({ extended: true }))
    LoadRoutes(this.api, resolve(__dirname, '../../api/routes'), this)

  }
  start(): void {
    this.api.listen(this.port)
  }
  async send(route: string, data: any) {
    const fetched = await fetch(`http://localhost:2013${route}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
    if (fetched.status !== 200) {
      console.log(`API | Did not receive response from worker internal API.`)
      this.notsent.push({ route, data })
      setTimeout(() => { this.send(route, data) }, 1.8e5)
    }
    if (fetched.status === 200 && this.notsent.length !== 0) {
      let i = 0;
      for (const data of this.notsent) {
        setTimeout(() => {
          fetch(`http://localhost:2013`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
          })
        }, 5000)
      }
      this.notsent = []
    }
  }
}