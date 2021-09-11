import { VTWorker } from "./structures/client/VTWorker";
import { CommandContext, SlashCommandContext } from "./structures/extensions/CommandContext";
import { bot as config } from './config.json'
const worker = new VTWorker({
  token: config.token,
})
worker.loadMiddlewares(__dirname + '/bot/middlewares')
worker.commands.options({
  bots: false,
  interactionGuild: '707479016696971275'
})
.load(__dirname + '/bot/commands')
.SlashCommandContext = SlashCommandContext
worker.commands.CommandContext = CommandContext