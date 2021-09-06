import express, { Express } from 'express'
import { LoadRoutes as loadRoutes } from '@jpbberry/load-routes'
import path from 'path'
import VoteTracker from '../structures/bot/VoteTracker'
export interface APIOptions {
  port: number | string

}
export class API {
  app: Express
  options: APIOptions
  client: VoteTracker
  constructor(options: APIOptions, client: VoteTracker) {
    this.app = express()
    this.options = options
    this.client = client
  }
  start(): void {
    loadRoutes(this.app, path.resolve(__dirname, '../routes/'), this)

    this.app.set('trust-proxy', true)

    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    this.app.listen(this.options.port, () => {
      console.log(`API started.`)
    })
  }
}