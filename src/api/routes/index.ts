import { RESTManager } from "../../structures/managers/REST";
import { Express } from 'express'
export default function (this: RESTManager, app: Express): void {
  app.post('/add-timer', (req, res) => {
    console.log(req.body)
    this.timers.set(`${req.body.guild}-${req.body.user}`, setTimeout(() => {
      this.send(`/timer-end`, { guild: req.body.guild, user: req.body.user })
      this.timers.delete(`${req.body.guild}-${req.body.user}`)
    }, 4.32e+7))
  })
  app.post('/vote', (req, res) => {
    this.send(`/new-vote`, req.body)
  })
  app.post('/reminder', (req, res) => {
    this.timers.set(req.body.user, setTimeout(() => {
      this.send('/reminder-send', { guild: req.body.guild, user: req.body.user })
      this.timers.delete(req.body.user)
    }, 3000))
  })
}