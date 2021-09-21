import { CommandContext } from "discord-rose";
export default () => {
  return async (ctx: CommandContext) => {
    return !(!ctx.guild && ctx.command.guildOnly);
  }
}
