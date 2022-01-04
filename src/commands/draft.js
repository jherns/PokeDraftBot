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
    interaction.reply(
      await draft(
        message.guildId,
        message.member.id,
        interaction.options.getString('pokemon').toLowerCase()
      )
    );
  },
};
