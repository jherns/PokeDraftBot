const { SlashCommandBuilder } = require('@discordjs/builders');
const { swap } = require('../models/pokemonModel.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('swap')
    .setDescription('Swap a pokemon onto your team')
    .addStringOption((option) =>
      option
        .setName('new_pokemon')
        .setDescription('The pokemon you want on your team.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('old_pokemon')
        .setDescription('The pokemon you want to drop.')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.reply(
      await swap(
        interaction.guildId,
        interaction.member.user.id,
        interaction.options.getString('new_pokemon').toLowerCase(),
        interaction.options.getString('old_pokemon').toLowerCase()
      )
    );
  },
};
