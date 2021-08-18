import { Cache } from '@jpbberry/cache'
import { Schema, model } from 'mongoose'

export interface GuildDoc {
  id: string
  prefix: string
  premium: boolean
  auth_code: string
  vote: {
    channel_id: string
    message: string
    role: string
  }
  moderation: {
    log: string
    roles: Array<string>
  }
}

const guildSchema = new Schema({
  id: { type: String, required: true, unique: true },
  prefix: { type: String, required: true, default: 'v!' },
  premium: { type: Boolean, required: true, default: false },
  auth_code: { type: String, default: null },
  vote: {
    channel_id: { type: String, default: null },
    message: { type: String, default: '{member} voted for us at {link}!' },
    role: { type: String, default: null },
  },
  moderation: {
    log: { type: String, default: null },
    roles: { type: Array, default: [] }
  }
})

const guildModel = model<GuildDoc>('guilds.config', guildSchema)

export class GuildDB {
  cache: Cache<string, GuildDoc> = new Cache(15 * 60 * 1000)

  async getGuild(id: string): Promise<GuildDoc> {
    const fromCache = this.cache.get(id)

    if (fromCache !== undefined) return fromCache

    const fromDB: GuildDoc = await guildModel.findOne({ id }).lean()

    if (fromDB !== null) {
      this.cache.set(id, fromDB)
      return fromDB
    }

    return await guildModel.create({ id })
  }

  public async updateGuild(doc: GuildDoc): Promise<void> {
    const id = doc.id
    this.cache.set(id, doc)

    await guildModel.updateOne({ id: doc.id }, doc, { upsert: true })
  }

  public async getPrefix(id: string): Promise<string> {
    const guildData = await this.getGuild(id)
    return guildData.prefix
  }

  public async setPrefix(id: string, prefix: string): Promise<void> {
    const guildData = await this.getGuild(id)
    guildData.prefix = prefix
    await this.updateGuild(guildData)
  }
}