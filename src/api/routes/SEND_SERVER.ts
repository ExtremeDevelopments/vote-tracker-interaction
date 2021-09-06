import { Router } from 'express'
import { API } from '..'

export default function (this: API, router: Router): void {
  router.post('/send', (req, res) => {
    interface APIResponse {
      guild: string
      user: string
      type: string
      authorization: string
    }
    this.client.emit('VOTE', req.body as APIResponse)
    res.status(200).send('Success 1')
  })
} 