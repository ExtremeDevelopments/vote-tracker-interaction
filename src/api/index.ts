import express, { Express } from 'express'
import { LoadRoutes as loadRoutes } from '@jpbberry/load-routes'
import path from 'path'
import { VTWorker } from '../structures/client/VTWorker'
export interface APIOptions {
  port: number | string

}
/**
 * WIP
 */
export class API {
  app: Express
  options: APIOptions
  worker: VTWorker
  constructor(options: APIOptions, worker: VTWorker) {
    this.app = express()
    this.options = options
    this.worker = worker
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