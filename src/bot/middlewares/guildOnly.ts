import { CommandContext } from "discord-rose";
export default () => {
  return async (ctx: CommandContext) => {
    if (!ctx.guild && ctx.command.guildOnly) {
      ctx.reply(`This command can only be ran within a guild!`)
      return false
    }
    
    return true
  }
}