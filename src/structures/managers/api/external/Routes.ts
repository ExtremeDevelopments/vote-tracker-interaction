import { LoadRoutes } from "@jpbberry/load-routes"
import express, { Express } from "express"
import { resolve } from "path"
import { APIManager } from "./Main"
export class RouterManager {
  app: Express
  constructor(private readonly API: APIManager) {
    this.app = express()

    this.app.use(express.json())
    this.app.use(express.urlencoded({
      extended: true
    }))

    LoadRoutes(this.app, resolve(__dirname, '../routes'), this.API)

    
  }
}