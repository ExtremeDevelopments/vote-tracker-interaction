import { CommandContext } from "../CommandContext";
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription(`Sends a fancy help command.`),
  defaultPermission: true,
  exec(client, interaction) {
    const embed = new MessageEmbed()
      .setAuthor(`Vote Tracker Help`, client.user?.displayAvatarURL())
    let commands = '';

    for (const [, command] of client.commands) {
      commands += `\`${command.data.name}\` - ${command.data.description}`
    }
    embed.setDescription(commands)
      .setFooter(interaction.user.tag + ` | Help`, interaction.user.displayAvatarURL({ dynamic: true }))
    interaction.reply({ embeds: [embed], ephemeral: true })
  }

} as CommandContext