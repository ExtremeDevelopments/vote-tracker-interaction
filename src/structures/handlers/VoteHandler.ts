import { Guild, TextChannel, Channel, MessageEmbed } from "discord.js";
import { GuildDoc } from "../../database/guild";
import VoteTracker from "../bot/VoteTracker";
import { UserDoc } from "../../database/user"
export default class VoteHandler {
  constructor(private readonly client: VoteTracker) {
    this.client.on('VOTE', (data: APIResponse) => {
      this.handleVote(data)
    })
  }
  async handleVote(data: APIResponse): Promise<void> {
    const guild = this.client.guilds.cache.get(data.guild) ||
      await this.client.guilds.fetch(data.guild)

    if (!guild) return

    const guildData = await this.client.db.guilds.getGuild(guild.id)
    if (!guildData.vote.channel_id) return
    if (data.authorization !== guildData.auth_code) return

    const channel = this.client.channels.cache.get(guildData.vote.channel_id) ||
      await this.client.channels.fetch(guildData.vote.channel_id)
    if (!channel || !channel.isText()) return

    const userData = await this.client.db.users.getUser(data.user)
    userData.total_votes + 1
    userData.last_vote = {
      date: new Date(),
      guild_id: data.guild
    }
    this.client.db.users.updateUser(userData)
    const userVoteData = await this.client.db.users.getUserVotes(data.user, data.guild)
    userVoteData.total_votes + 1
    userVoteData.last_vote = new Date()
    this.sendVoteMessage(channel, guildData, guild, userData)
  }
  async sendVoteMessage(channel: Channel, guildData: GuildDoc, guild: Guild, userData: UserDoc) {
    if (!channel.isText()) return
    const embed = new MessageEmbed()
      .setTitle(`User Voted! 🎉`)
      .setDescription(this.replaceData(guildData, userData.id))
      .setColor(this.client.colors.ORANGE)
      .setFooter(`Server Voting+`)
      .setTimestamp()
    channel.send({ content: `<@${userData.id}>,`, embeds: [embed] })
  }
  replaceData(data: GuildDoc, user: string): string {
    let string = data.vote.message

    string = string.replace('{page}', `https://top.gg/servers/${data.id}`)
      .replace('{member}', `${user}`)
      .replace('{vote}', `https://top.gg/servers/${data.id}/vote`)
      .replace('{invite}', `https://top.gg/servers/${data.id}/join`)
      .replace('{serverID}', `${data.id}`)
      .replace(`{guildID}`, `${data.id}`)


    return string
  }
}
interface APIResponse {
  guild: string
  user: string
  type: string
  authorization: string
}