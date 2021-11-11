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
  const replacements: Array<{ searchValue: string, replaceValue: string }> = [{
    searchValue: '{page}',
    replaceValue: `https://top.gg/servers/${data.id}`,
  },
  {
    searchValue: '{member}',
    replaceValue: `<@${user}>`
  },
  {
    searchValue: '{user}',
    replaceValue: `<@!${user}>`
  },
  {
    searchValue: '{vote}',
    replaceValue: `https://top.gg/servers/${data.id}/vote`
  },
  {
    searchValue: '{invite}',
    replaceValue: `https://top.gg/servers/${data.id}/join`
  },
  {
    searchValue: '{serverID}',
    replaceValue: data.id
  },
  {
    searchValue: '{guildID}',
    replaceValue: data.id
  },
  {
    searchValue: '{link}',
    replaceValue: `https://top.gg/servers/${data.id}`
  }]
  for (const item of replacements) {
    string.replace(item.searchValue, item.replaceValue)
  }
  return string
}