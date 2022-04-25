const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Displays server name'),
  async execute(interaction) {
    await interaction.reply({
      content: `This server's name is: ${interaction.guild.name}`,
      ephemeral: true,
    });
  },
};
