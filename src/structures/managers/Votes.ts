import { Express } from "express";
import { Snowflake } from "discord-api-types";
import { Database } from "../database";
import { Embed } from "discord-rose";
import { replace } from "../../utils";
import { WorkerAPI } from "../client/RESTWorker";
import { VTWorker } from "../client/VTWorker";
import { colors } from "../extensions/Colors";
export default class VoteManager {
  app: Express
  db: Database //Shorthand
  worker: VTWorker
  constructor(rest: WorkerAPI) {
    this.app = rest.app
    this.db = rest.db
    this.worker = rest.worker
    this.app.post('/new-vote', (req, res) => {
      res.sendStatus(200)
      this.handleVote(req.body as APIResponse)
    })
  }
  async handleVote(data: APIResponse): Promise<void> {
    const guild = await this.db.guilds.getGuild(data.guild)
    const user = await this.db.users.getUserVotes(data.user, data.guild)

    user.last_vote = Date.now()
    user.total_votes++
    await this.db.users.updateVoteUser(user)
    this.worker.rest.timeManager.send('/reminder', { guild: guild.id, user: user.id })
    if (guild.vote.channel_id === null) return

    const channel = this.worker.channels.get(guild.vote.channel_id) ??
      await this.worker.api.channels.get(guild.vote.channel_id)
    if (!channel) return

    const voteEmbed = new Embed()
      .title(`User voted! 🎉`, `https://top.gg/servers/${guild.id}`)
      .description(replace(guild.vote.message, data.user, guild))
      .timestamp()
      .color(colors.ORANGE)

    this.worker.api.messages.send(channel.id, { embeds: [voteEmbed.render()], content: `<@${data.user}>,` })
    console.log(guild.vote)
    if (!guild.vote.role) return

    this.worker.api.members.addRole(guild.id, user.id, guild.vote.role).catch(console.log)
    this.worker.rest.timeManager.send('/add-timer', {
      guild: guild.id,
      user: user.id
    })

  }
}
interface APIResponse {
  guild: Snowflake
  user: Snowflake
  type: "upvote" | "test"
  query?: string
}