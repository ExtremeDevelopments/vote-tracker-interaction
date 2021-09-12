import { VTWorker } from "../../client/VTWorker";
import { WorkerAPI } from "../workerAPI";
import { Database } from "../../database";
import fetch from 'node-fetch'
export default class TimeHandler {
  worker: VTWorker
  db: Database
  notsent: Array<any>
  constructor(api: WorkerAPI) {
    this.worker = api.worker
    this.db = api.db
    this.notsent = []
    api.app.post(`/timer-end`, async (req, res) => {
      res.sendStatus(200)
      console.log(req.body)
      this.handleTimer(req.body)
    })
  }
  async handleTimer(data: any) {

    const guild = await this.db.guilds.getGuild(data.guild)
    if (!guild.vote.role) return console.log(guild.vote)
    this.worker.api.members.removeRole(guild.id, data.user, guild.vote.role).catch(e => console.log(e))
  }
  async send(route: string, data: any) {
    const fetched = await fetch(`http://localhost:2312${route}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json'}
    })
    console.log(JSON.stringify(data))
    if (!fetched.ok) {
      console.log(`Worker | Did not receive response from external API.`)
      this.notsent.push({ route, data })
      setTimeout(() => { this.send(route, data) }, 1.8e5)
    }
    if (fetched.ok && this.notsent.length !== 0) {
      let i = 0;
      for (const data of this.notsent) {
        setTimeout(() => {
          fetch(`http://localhost:2312`, {
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