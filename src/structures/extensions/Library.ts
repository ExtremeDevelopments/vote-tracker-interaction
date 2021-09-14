import { VTWorker } from '../client/VTWorker'

declare module 'discord-rose/dist/typings/lib' {
  interface CommandOptions {
    disabled?: boolean
    interactionOnly?: boolean
    guildOnly?: boolean
    ownerOnly?: boolean
    deletable?: boolean
  }
  type worker = VTWorker
}