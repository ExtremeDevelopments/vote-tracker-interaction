import { VTWorker } from "./structures/client/VTWorker";
import { CommandContext, SlashCommandContext } from "./structures/extensions/CommandContext";

const worker = new VTWorker({
  token: 'Nzc1ODM5NzYyMzg3OTU5ODc4.X6sLFQ.QrVFQDx0ly6D29opHDtfBqfcGs0',
})
worker.loadMiddlewares(__dirname + '/bot/middlewares')
worker.commands.options({
  bots: false,
  interactionGuild: '707479016696971275'
})
.load(__dirname + '/bot/commands')
.SlashCommandContext = SlashCommandContext
worker.commands.CommandContext = CommandContext