import { connect } from "mongoose";
import { VTWorker } from "../client/VTWorker";
import { GuildDB } from "./components/Guilds";
import { UserDB } from "./components/Users";

export type DBOptions = string | {
  ip: string
  port: number
  options?: string
  username?: string
  password?: string
}

export class Database {
  users: UserDB
  guilds: GuildDB
  constructor(private readonly options: DBOptions) {
    this.users = new UserDB()
    this.guilds = new GuildDB()
    const connectionString = typeof options === 'string'
      ? options
      : 'mongodb://' +
      `${options.username && options.password ? `${options.username}:${options.password}@` : ''}` +
      `${options.ip ? options.ip : 'localhost'}` +
      ':' +
      `${options.port ? options.port : '27017'}` +
      `${options.options ? options.options : ''}`

    connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => console.log('Connected to Database.'))
      .catch(() => console.log('Connection to database failed.'))
  }
}