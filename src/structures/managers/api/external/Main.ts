import { Cache } from "@jpbberry/cache"
import fetch from 'node-fetch'
import { Database } from "../../../database"
import { RouterManager } from "./Routes"

export class APIManager {
  db = new Database('mongodb://localhost:27017/votetracker')
  router = new RouterManager(this)
  timers = new Cache<string, NodeJS.Timeout>(15 * 60 * 1000)
  notsent: Array<any> = []
  constructor() {
    this.router.app.listen(2312)

  }

  async send(route: string, data: any) {
    const fetched = await fetch(`http://localhost:2013${route}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json'}
    })
    if (!fetched.ok) {
      console.log(`API | Did not receive response from worker internal API.`)
      this.notsent.push({ route, data })
      setTimeout(() => { this.send(route, data) }, 1.8e5)
    }
    if (fetched.ok && this.notsent.length !== 0) {
      let i = 0;
      for (const data of this.notsent) {
        setTimeout(() => {
          fetch(`http://localhost:2013`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json'}
          })
        }, 5000)
      }
      this.notsent = []
    }
  }
}