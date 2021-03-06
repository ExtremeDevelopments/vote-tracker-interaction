import { VTWorker } from "./structures/client/VTWorker";
import { CommandContext, SlashCommandContext } from "./structures/extensions/CommandContext";
import { bot as config } from './config.json'
import permissionsMiddleware from '@discord-rose/permissions-middleware'
const worker = new VTWorker({
  token: config.token,
  cache: {
    users: true
  }
})
worker.loadMiddlewares(__dirname + '/bot/middlewares')
worker.commands.middleware(permissionsMiddleware())
worker.commands.options({
  bots: false,
  interactionGuild: '738604310060990555'
})
worker.commands.prefix((message) => {
  if(!message.guild_id) return 'v!'
  return worker.db.guilds.getPrefix(message.guild_id)
})
worker.commands.load(__dirname + '/bot/commands')
worker.commands.CommandContext = CommandContext
worker.commands.SlashCommandContext = SlashCommandContext
worker.setStatus("watching", "votes fly by!")