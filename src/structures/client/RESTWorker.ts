import { VTWorker } from "./VTWorker";
import TimeManager from "../managers/Times";
import VoteManager from "../managers/api/internal/Votes";
import express, { Express } from 'express'
import { Database } from "../database";
export class WorkerAPI {
  db: Database
  worker: VTWorker
  voteManager: VoteManager
  timeManager: TimeManager
  app: Express
  constructor(worker: VTWorker) {
    this.worker = worker
    this.app = express()
    this.db = worker.db
    this.app.use(express.json())
    this.app.use(express.urlencoded({
      extended: true
    }))
    this.voteManager = new VoteManager(this)
    this.timeManager = new TimeManager(this)
    this.app.listen(2013)
  }
}