const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('Get the pokemon for the provided team')
    .addUserOption((option) =>
      option
        .setName('owner')
        .setDescription('The owner of the team')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply('hello');
  },
};
