import { Schema, model } from "mongoose";
import { Snowflake } from "discord-api-types";
import { Cache } from '@jpbberry/cache'
import { VTWorker } from "../../client/VTWorker";
export interface UserDoc {
  id: Snowflake
  blacklisted: boolean
  owner: boolean
  total_votes: number
  last_vote: {
    date: Date | null
    guild_id: Snowflake | null
  }
}
export interface UserVoteDoc {
  id: Snowflake
  guild_id: Snowflake
  total_votes: number
  last_vote: Date
}
const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  blacklisted: { type: Boolean, default: false },
  owner: { type: Boolean, default: false },
  total_votes: { type: Number, default: 0 },
  last_vote: {
    date: { type: Date, default: null },
    guild_id: { type: String, default: null }
  }
})
const userVoteSchema = new Schema({
  id: { type: String, required: true },
  guild_id: { type: String, required: true },
  total_votes: { type: Number, default: 0 },
  last_vote: { type: Date, default: null }
})

const userModel = model<UserDoc>('users.global', userSchema)
const userVoteModel = model<UserVoteDoc>('users.votes', userVoteSchema)

export class UserDB {
  cache = {
    votes: new Cache<Snowflake, UserVoteDoc>(15 * 60 * 1000),
    globals: new Cache<Snowflake, UserDoc>(15 * 60 * 1000)
  }
  constructor(private readonly worker: VTWorker) { }

  async getUser(id: Snowflake): Promise<UserDoc> {
    const fromCache = this.cache.globals.get(id)

    if (fromCache !== undefined) return fromCache

    const fromDB: UserDoc = await userModel.findOne({ id }).lean()

    if (fromDB) {
      this.cache.globals.set(id, fromDB)
      return fromDB
    }

    return await userModel.create({ id })
  }

  async getUserVotes(id: Snowflake, guild_id: Snowflake): Promise<UserVoteDoc> {
    const appended = `${guild_id}-${id}`
    const fromCache = this.cache.votes.get(appended)

    if (fromCache !== undefined) return fromCache

    const fromDB: UserVoteDoc = await userVoteModel.findOne({ id }).lean()

    if (fromDB) {
      this.cache.votes.set(id, fromDB)
      return fromDB
    }

    return await userVoteModel.create({ id, guild_id })
  }

  async updateUser(doc: UserDoc): Promise<void> {
    this.cache.globals.set(doc.id, doc)
    await userModel.updateOne({ id: doc.id }, doc, { upsert: true })
  }

  async UpdateVoteUser(doc: UserVoteDoc): Promise<void> {
    this.cache.votes.set(`${doc.guild_id}-${doc.id}`, doc)

    await userVoteModel.updateOne({ id: doc.id, guild_id: doc.guild_id }, doc, { upsert: true })
  }

  async getOwner(id: Snowflake): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.owner
  }

  async setOwner(id: Snowflake, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.owner = value
    await this.updateUser(userData)
  }

  async getBlacklisted(id: Snowflake): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.blacklisted
  }

  async setBlacklisted(id: Snowflake, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.blacklisted = value
    await this.updateUser(userData)
  }
}