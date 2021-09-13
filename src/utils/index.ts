import { GuildDoc } from "../structures/database/components/Guilds";
export function createID(notAllowed: Array<string | null>, l: number): string {
  let result = '';

  const characters = '0123456789ABCDEFGHIJKLMNAOPQRSTUVWXYZ'
  for (var i = 0; i < l; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  if (notAllowed.includes(result)) return createID(notAllowed, l)
  return result
}
export function replace(string: string, user: string, data: GuildDoc) {
  return string
  .replace('{page}', `https://top.gg/servers/${data.id}`)
  .replace('{member}', `<@${user}>`)
  .replace('{user}', `<@${user}>`)
  .replace('{vote}', `https://top.gg/servers/${data.id}/vote`)
  .replace('{invite}', `https://top.gg/servers/${data.id}/join`)
  .replace('{serverID}', `${data.id}`)
  .replace(`{guildID}`, `${data.id}`)
  .replace('{link}', `https://top.gg/servers/${data.id}`)
}