import { APIMessage } from "discord-api-types";
import { SlashCommandContext as SlashContext, CommandContext as CmdContext } from "discord-rose";
import { MessageTypes } from "discord-rose";

export class SlashCommandContext extends SlashContext {
  async send(data: MessageTypes, ephermal: boolean = false): Promise<null> {
    return await super.send(data, ephermal)
  }
}
export class CommandContext extends CmdContext {
  async send(data: MessageTypes): Promise<APIMessage> {
    return await super.send(data)
  }
}