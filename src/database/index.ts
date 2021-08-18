import { connect } from 'mongoose'
import { GuildDB } from './guild'
import { UserDB } from './user'

export type DBOptions = string | {
  ip: string
  port: number
  options?: string
  username?: string
  password?: string
}

export class Database {
  userDB = new UserDB()
  guildDB = new GuildDB()
  constructor(private readonly options: DBOptions) {
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
      useFindAndModify: false,
      useCreateIndex: true
    })
      .then(() => { console.log('Database connected.') })
      .catch(() => { console.warn('Database connection failed.') })
  }
}