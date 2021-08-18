import { ClientOptions, Intents } from "discord.js";
import { DBOptions } from "./database";
import Master from "./structures/Master";

const clientOptions: ClientOptions = {
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
}
const dbOptions = "mongodb://localhost:27017/vote_tracker"

const apiOptions = {
  port: 5639
}

new Master(clientOptions, dbOptions, apiOptions)