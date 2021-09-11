export function createID(notAllowed: Array<string | null>, l: number): string {
  let result = '';

  const characters = '0123456789ABCDEFGHIJKLMNAOPQRSTUVWXYZ'
  for (var i = 0; i < l; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  if (notAllowed.includes(result)) return createID(notAllowed, l)
  return result
}