import { LoadRoutes } from "@jpbberry/load-routes"
import express, { Express } from "express"
import { resolve } from "path"
import { APIHandler } from "./APIHandler"
export class RouterHandler {
  app: Express
  constructor(private readonly API: APIHandler) {
    this.app = express()

    this.app.use(express.json())
    this.app.use(express.urlencoded({
      extended: true
    }))

    LoadRoutes(this.app, resolve(__dirname, '../routes'), this.API)

    
  }
}