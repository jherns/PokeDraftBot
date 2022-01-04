const { draft } = require('../models/pokemonModel.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('draft')
    .setDescription('Draft a pokemon for your team')
    .addStringOption((option) =>
      option
        .setName('pokemon')
        .setDescription('The pokemon you want to draft.')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply(
      await draft(
        interaction.guildId,
        interaction.member.user.id,
        interaction.options.getString('pokemon').toLowerCase()
      )
    );
  },
};
