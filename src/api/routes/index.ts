import { RESTManager } from "../../structures/managers/REST";
import { Express } from 'express'

export default function (this: RESTManager, app: Express): void {
  app.post('/add-timer', (req, _res) => {
    console.log(req.body)
    this.timers.set(`${req.body.guild}-${req.body.user}`, setTimeout(() => {
      void this.send(`/timer-end`, { guild: req.body.guild, user: req.body.user })
      this.timers.delete(`${req.body.guild}-${req.body.user}`)
    }, 4.32e+7))
  })

  app.post('/vote', (req, _res) => {
    void this.send(`/new-vote`, req.body)
  })

  app.post('/reminder', (req, _res) => {
    this.timers.set(req.body.user, setTimeout(() => {
      void this.send('/reminder-send', { guild: req.body.guild, user: req.body.user })
      this.timers.delete(req.body.user)
    }, 3000))
  })
}
