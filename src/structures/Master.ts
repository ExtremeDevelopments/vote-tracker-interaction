import { ClientOptions } from "discord.js";
import { API, APIOptions } from "../api";
import VoteTracker from "../bot/VoteTracker";
import { Database, DBOptions } from "../database";

export default class Master {
  bot: VoteTracker;
  db: Database
  api: API
  constructor(clientOptions: ClientOptions, DBOptions: DBOptions, APIOptions: APIOptions) {
    this.db = new Database(DBOptions)
    this.api = new API(APIOptions, this)
    this.bot = new VoteTracker(clientOptions, this)
  }
}