import { Schema, model } from "mongoose";
import { Cache } from '@jpbberry/cache'

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

const userModel = model<UserDoc>('users', userSchema)

export class UserDB {
  cache: Cache<string, UserDoc> = new Cache(15 * 60 * 1000)


  async getUser(id: string): Promise<UserDoc> {
    const fromCache = this.cache.get(id)

    if (fromCache !== undefined) return fromCache

    const fromDB: UserDoc = await userModel.findOne({ id }).lean()
    
    if (fromDB) {
      this.cache.set(id, fromDB)
      return fromDB
    }

    return await userModel.create({ id })
  }
  async updateUser(doc: UserDoc): Promise<void> {
    const id = doc.id
    this.cache.set(id, doc)

    await userModel.updateOne({ id: doc.id }, doc, { upsert: true })
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