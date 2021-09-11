import { VTWorker } from '../client/VTWorker'

declare module 'discord-rose/dist/typings/lib' {
  interface CommandOptions {
    description: string
    category: string
    usage: string
    name: string
    disabled?: boolean
    interactionOnly?: boolean
    guildOnly?: boolean
    ownerOnly?: boolean
    onlyInteractions?: boolean
  }
  type worker = VTWorker
}