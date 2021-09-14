import { Cache } from "@jpbberry/cache";
import { APIMessageComponentInteraction, ComponentType, GatewayInteractionCreateDispatchData, InteractionType } from "discord-api-types";
import { VTWorker } from "../client/VTWorker";
/**
 * WIP
 * 1. Add response when incorrect user clicks trash can
 */
export class ButtonManager {
  worker: VTWorker;
  cache = new Cache<string, ButtonDoc>(15 * 60 * 1000)
  constructor(worker: VTWorker) {
    this.worker = worker
    this.worker.on('INTERACTION_CREATE', (data) => {
      if (data.type !== InteractionType.MessageComponent) return
      if (data.data.component_type !== ComponentType.Button) return
      if (data.message.author.id !== this.worker.user.id) return
      this.handleButton(data)
    })
  }
  handleButton(data: APIMessageComponentInteraction) {
    const found = this.cache.get(data.data.custom_id)
    if (!found) return

    if (data.member?.user.id !== found.author_id) return
    this.worker.api.messages.delete(data.channel_id, data.message.id).catch(e => null)
    this.cache.delete(data.data.custom_id)
  }
  createButton(ID: string, data: ButtonDoc) {
    this.cache.set(ID, data)
  }
  sendInteraction(data: GatewayInteractionCreateDispatchData) {

  }
}
export interface ButtonDoc {
  author_id: string
}