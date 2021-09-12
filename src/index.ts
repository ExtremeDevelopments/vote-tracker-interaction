import { VTWorker } from "./structures/client/VTWorker";
import { CommandContext, SlashCommandContext } from "./structures/extensions/CommandContext";
import { bot as config } from './config.json'
const worker = new VTWorker({
  token: config.token,
  cache: {
    users: true
  }
})
worker.loadMiddlewares(__dirname + '/bot/middlewares')
worker.commands.options({
  bots: false,
  interactionGuild: '707479016696971275'
})
.prefix((message) => {
  if(!message.guild_id) return 'v!'
  return worker.db.guilds.getPrefix(message.guild_id)
})
.load(__dirname + '/bot/commands')
.SlashCommandContext = SlashCommandContext
worker.commands.CommandContext = CommandContext