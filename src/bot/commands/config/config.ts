import { ApplicationCommandOptionType, Snowflake } from "discord-api-types";
import { CommandOptions } from "discord-rose";
import { colors } from "../../../structures/extensions/Colors";

export default <CommandOptions>{
  command: 'config',
  interactionOnly: true,
  guildOnly: true,
  interaction: {
    name: 'config',
    description: 'Setup the configuration of the server.',
    options: [
      {
        name: 'channel',
        description: 'Channel to send votes to.',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'channel',
            description: 'Channel to send all votes to.',
            type: ApplicationCommandOptionType.Channel,
            required: true
          }
        ]
      },
      {
        name: 'message',
        description: 'Message to send when a user votes.',
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: 'replacements',
            description: 'View valid replacements to work on message strings.',
            type: ApplicationCommandOptionType.Subcommand
          },
          {
            name: 'set',
            description: 'Set the vote message for your server.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: 'string',
                type: ApplicationCommandOptionType.String,
                required: true,
                description: 'Message string'
              }
            ]
          }
        ]
      },
      {
        name: 'role',
        description: 'Role to be given upon voting.',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'role',
            description: 'New vote role.',
            type: ApplicationCommandOptionType.Role,
            required: true
          }
        ]
      }
    ]
  },
  exec: async (ctx) => {
    ctx.args = [ctx.options]
    const guildData = await ctx.worker.db.guilds.getGuild(ctx.guild?.id as Snowflake)

    if (ctx.options.channel) {
      if (guildData.vote.channel_id === ctx.options.channel.channel) return ctx.reply(`This is already the set channel for vote messages to be sent to.`, false, true)

      guildData.vote.channel_id = ctx.options.channel.channel

      await ctx.worker.db.guilds.updateGuild(guildData)
      return ctx.reply(`Updated the vote channel to <#${ctx.options.channel.channel}>!`, false, true)
    }

    if (ctx.options.message) {
      if (ctx.options.message.replacements) {
        const embed = ctx.embed
          .title(`Valid replacement strings.`)
          .description(`
        \`{user | member}\` - Mention the user
        \`{vote}\` - Display the link to vote for your server.
        \`{invite}\` - Display the top.gg invite link for your server.
        \`{serverID | guildID}\` - Display the server ID.
        \`{link | page}\` - Display the link to your top.gg server main page.
        `)
          .footer(`If you need further support, contact us in our support server! (/help)`)
          .color(colors.ORANGE)

        return ctx.reply({ embeds: [embed.render()] }, false, true)
      }
      if (ctx.options.message.set) {
        if (ctx.options.message.set.string.length > 4080) return ctx.reply(`The message must be under 4080 characters.`, false, true)
        if (guildData.vote.message === ctx.options.message.set.string) return ctx.reply(`This is already the current message!`, false, true)

        guildData.vote.message = ctx.options.message.set.string
        await ctx.worker.db.guilds.updateGuild(guildData)
        return ctx.reply(`Updated vote message!`, false, true)
      }
    }

    if (ctx.options.role) {
      if (guildData.vote.role === ctx.options.role.role)
        return ctx.reply(`This is already the selected vote role!`, false, true)

      guildData.vote.role = ctx.options.role.role

      await ctx.worker.db.guilds.updateGuild(guildData)

      return ctx.reply(`Updated the vote role!`, false, true)
    }
  }
}
