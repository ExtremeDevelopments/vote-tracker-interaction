import { CommandContext } from "discord-rose";
export default () => {
  return async (ctx: CommandContext) => {
    if (!ctx.guild && ctx.command.guildOnly) return false
    
    return true
  }
}