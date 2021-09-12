import { VTWorker } from "../client/VTWorker";
import TimeHandler from "./handlers/TimeHandler";
import VoteHandler from "./handlers/VoteHandler";
import express, { Express } from 'express'
import { Database } from "../database";
export class WorkerAPI {
  db: Database
  worker: VTWorker
  voteHandler: VoteHandler
  timeHandler: TimeHandler
  app: Express
  constructor(worker: VTWorker) {
    this.worker = worker
    this.app = express()
    this.db = worker.db
    this.app.use(express.json())
    this.app.use(express.urlencoded({
      extended: true
    }))
    this.voteHandler = new VoteHandler(this)
    this.timeHandler = new TimeHandler(this)
    this.app.listen(2013)
  }
}