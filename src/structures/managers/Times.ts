import { VTWorker } from "../client/VTWorker";
import { WorkerAPI } from "../client/RESTWorker";
import { Database } from "../database";
import fetch from 'node-fetch'
import { Embed } from "discord-rose";
import { colors } from "../extensions/Colors";
export default class TimeManager {
  worker: VTWorker
  db: Database
  notsent: Array<any>
  constructor(rest: WorkerAPI) {
    this.worker = rest.worker
    this.db = rest.db
    this.notsent = []
    rest.app.post(`/timer-end`, async (req, res) => {
      res.sendStatus(200)
      this.handleTimer(req.body)
    })
    rest.app.post('/reminder-send', async (req, res) => {
      res.sendStatus(200)
      this.handleReminder(req.body)
    })
  }
  async handleTimer(data: any) {
    const guild = await this.db.guilds.getGuild(data.guild)
    if (!guild.vote.role) return
    this.worker.api.members.removeRole(guild.id, data.user, guild.vote.role).catch(e => console.log(e))
  }
  async handleReminder(data: any) {
    const user = await this.db.users.getUser(data.user)
    const guild = this.worker.guilds.get(data.guild) ??
      await this.worker.api.guilds.get(data.guild)
    if (!user.reminders) return
    await this.worker.api.users.createDM(user.id)
    this.worker.api.users.dm(user.id, {
      embeds: [new Embed()
        .title(`Vote reminder!`)
      .description(`It has been 12 hours since you have voted! 
      The last guild you voted for was [${guild.name}](https://top.gg/server/${guild.id})`)
      .timestamp()
      .thumbnail(`https://cdn.discordapp.com/avatars/${this.worker.user.id}/${this.worker.user.avatar}.png`)
      .color(colors.ORANGE)
      .render()]
    })
  }
  async send(route: string, data: any) {
    const fetched = await fetch(`http://localhost:2312${route}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    })
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
            headers: { 'Content-Type': 'application/json' }
          })
        }, 5000)
      }
      this.notsent = []
    }
  }
}