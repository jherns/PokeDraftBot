const { getPokemonInfo } = require('../utils.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pokemon')
    .setDescription(
      'Provides information about the abilities, type(s), and stats for the specified pokemon'
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the pokemon.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const pokemonName = interaction.options.getString('name');
    const pokemonInfo = await getPokemonInfo(pokemonName);
    await interaction.reply(`pokemonInfo`);
  },
};
