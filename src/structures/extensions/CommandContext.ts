import { APIMessage, ComponentType } from "discord-api-types";
import { SlashCommandContext as SlashContext, CommandContext as CmdContext, Embed } from "discord-rose";
import { MessageTypes } from "discord-rose";
import { createID } from "../../utils";

export class SlashCommandContext extends SlashContext {
  async send(data: MessageTypes, ephermal: boolean = false): Promise<null> {
    return await super.send(data, ephermal)
  }
  async reply(data: MessageTypes, mention?: boolean | undefined, ephermal?: boolean | undefined): Promise<null> {
    console.log("used")
    const finalID = createID(this.worker.buttons.cache.map((x, e) => e), 16)
    if (this.command.deletable && typeof data === 'object') {
      if (!(data instanceof Embed)) {
        data.components = data.components = [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                custom_id: finalID,
                style: 4,
                emoji: {
                  name: 'trashcan',
                  id: '887126144120422440',
                  animated: false
                }
              }
            ]
          }
        ]
      }
    }
    console.log(data)
    const msg = await super.send(data, ephermal)

    if (!ephermal) this.worker.buttons.createButton(finalID, { author_id: this.author.id })
    return null
  }
}
export class CommandContext extends CmdContext {
  async reply(data: MessageTypes, mention?: boolean | undefined, ephermal?: boolean | undefined) {
    console.log(`ran`)
    const finalID = createID(this.worker.buttons.cache.map((x, e) => e), 16)
    if (this.command.deletable && typeof data === 'object') {
      if (!(data instanceof Embed)) {

        data.components = data.components?.concat([
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                custom_id: finalID,
                style: 4,
                label: '<:trashcan:887126144120422440>'
              }
            ]
          }
        ])
        console.log(`added`)
      }
    }

    const msg = await super.reply(data, mention, ephermal)
    this.worker.buttons.createButton(finalID, { author_id: this.author.id })
    return msg
  }
}