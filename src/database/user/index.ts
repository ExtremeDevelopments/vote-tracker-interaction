import { Schema, model } from "mongoose";
import { Cache } from '@jpbberry/cache'
import VoteTracker from "../../structures/bot/VoteTracker";

export interface UserDoc {
  id: string
  blacklisted: boolean
  owner: boolean
  total_votes: number
  last_vote: {
    date: Date | null
    guild_id: string | null
  }
}
export interface UserVoteDoc {
  id: string
  guild_id: string
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
  guild: { type: String, required: true },
  total_votes: { type: Number, default: 0 },
  last_vote: { type: Date, default: null }
})

const userModel = model<UserDoc>('users.global', userSchema)
const userVoteModel = model<UserVoteDoc>('users.votes', userVoteSchema)
export class UserDB {
  cache = {
    votes: new Cache<string, UserVoteDoc>(15 * 60 * 1000),
    globals: new Cache<string, UserDoc>(15 * 60 * 1000)
  }
  constructor(private readonly client: VoteTracker) { }
  async getUser(id: string): Promise<UserDoc> {
    this.client.influx.addDBCount('users')
    const fromCache = this.cache.globals.get(id)

    if (fromCache !== undefined) return fromCache

    const fromDB: UserDoc = await userModel.findOne({ id }).lean()

    if (fromDB) {
      this.cache.globals.set(id, fromDB)
      return fromDB
    }

    return await userModel.create({ id })
  }
  async getUserVotes(id: string, guildId: string): Promise<UserVoteDoc> {
    this.client.influx.addDBCount('users-votes')
    const appended = `${guildId}-${id}`
    const fromCache = this.cache.votes.get(id)

    if (fromCache !== undefined) return fromCache

    const fromDB: UserVoteDoc = await userVoteModel.findOne({ id, guild_id: guildId }).lean()

    if (fromDB) {
      this.cache.votes.set(appended, fromDB)
      return fromDB
    }

    return await userVoteModel.create({ id, guild_id: guildId })
  }
  async updateUser(doc: UserDoc): Promise<void> {
    this.client.influx.addDBCount('users')
    const id = doc.id
    this.cache.globals.set(id, doc)

    await userModel.updateOne({ id: doc.id }, doc, { upsert: true })
  }
  async updateVoteUser(doc: UserVoteDoc): Promise<void> {
    this.client.influx.addDBCount('users-votes')
    this.cache.votes.set(`${doc.guild_id}-${doc.id}`, doc)

    await userVoteModel.updateOne({ id: doc.id, guild_id: doc.guild_id }, doc, { upsert: true })
  }

  async getOwner(id: string): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.owner
  }

  async setOwner(id: string, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.owner = value
    await this.updateUser(userData)
  }

  async getBlacklisted(id: string): Promise<boolean> {
    const userData = await this.getUser(id)
    return userData.blacklisted
  }

  async setBlacklisted(id: string, value: boolean): Promise<void> {
    const userData = await this.getUser(id)
    userData.blacklisted = value
    await this.updateUser(userData)
  }
}