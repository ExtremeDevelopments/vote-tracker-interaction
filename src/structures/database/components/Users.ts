import { Schema, model } from "mongoose";
import { Snowflake } from "discord-api-types";
import { Cache } from '@jpbberry/cache'
import { VTWorker } from "../../client/VTWorker";
export interface UserDoc {
  id: Snowflake
  blacklisted: boolean
  owner: boolean
  reminders: boolean
  total_votes: number
}
export interface UserVoteDoc {
  id: Snowflake
  guild_id: Snowflake
  total_votes: number
  last_vote: number
  streak: number
  highest_streak: number
}
const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  blacklisted: { type: Boolean, default: false },
  owner: { type: Boolean, default: false },
  reminders: { type: Boolean, default: false },
  total_votes: { type: Number, default: 0 },
})
const userVoteSchema = new Schema({
  id: { type: String, required: true },
  guild_id: { type: String, required: true },
  total_votes: { type: Number, default: 0 },
  last_vote: { type: Date, default: null },
  streak: { type: Number, default: 0 },
  highest_streak: { type: Number, default: 0 }
})

const userModel = model<UserDoc>('users.global', userSchema)
const userVoteModel = model<UserVoteDoc>('users.votes', userVoteSchema)

export class UserDB {
  cache = {
    votes: new Cache<Snowflake, UserVoteDoc>(15 * 60 * 1000),
    globals: new Cache<Snowflake, UserDoc>(15 * 60 * 1000)
  }

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

  async updateVoteUser(doc: UserVoteDoc): Promise<void> {
    this.cache.votes.set(`${doc.guild_id}-${doc.id}`, doc)
    console.log(doc)
    await userVoteModel.updateOne({ id: doc.id, guild_id: doc.guild_id }, doc, { upsert: true })
  }

  async getOwner(id: Snowflake): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.owner
  }

  async setOwner(id: Snowflake, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.owner = value
    this.cache.globals.set(userData.id, userData)
    await this.updateUser(userData)
  }

  async getBlacklisted(id: Snowflake): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.blacklisted
  }

  async setBlacklisted(id: Snowflake, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.blacklisted = value
    this.cache.globals.set(userData.id, userData)
    await this.updateUser(userData)
  }
}