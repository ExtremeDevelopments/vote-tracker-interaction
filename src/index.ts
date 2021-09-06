import VoteTracker from "./structures/bot/VoteTracker";

const VT = new VoteTracker({
  intents: 1543,
  partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER']
})
VT.start()