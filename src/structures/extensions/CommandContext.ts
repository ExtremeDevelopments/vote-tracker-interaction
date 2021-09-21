import { APIMessage, ComponentType } from "discord-api-types";
import { SlashCommandContext as SlashContext, CommandContext as CmdContext, Embed } from "discord-rose";
import { MessageTypes } from "discord-rose";
import { createID } from "../../utils";

export class SlashCommandContext extends SlashContext {
  get db() {
    return this.worker.db
  }

  async send(data: MessageTypes, ephemeral: boolean = false): Promise<null> {
    return await super.send(data, ephemeral)
  }

  async reply(data: MessageTypes, mention?: boolean | undefined, ephemeral?: boolean | undefined): Promise<null> {
    const finalID = createID(this.worker.managers.buttons.cache.map((_button, key) => key), 16)
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

    await super.send(data, ephemeral)

    if (!ephemeral) this.worker.managers.buttons.createButton(finalID, { author_id: this.author.id })
    return null
  }
}

export class CommandContext extends CmdContext {
  get db() {
    return this.worker.db
  }

  async reply(data: MessageTypes, mention?: boolean | undefined, ephemeral?: boolean | undefined) {
    const finalID = createID(this.worker.managers.buttons.cache.map((_button, key) => key), 16)
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
      }
    }

    this.worker.managers.buttons.createButton(finalID, { author_id: this.author.id })
    return await super.reply(data, mention, ephemeral)
  }
}
