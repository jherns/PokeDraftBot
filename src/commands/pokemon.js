const getPokemonInfo = require('../pokeAPIWrapper/pokemonInfo.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('pokemon')
  .setDescription('Provides information about the abilities, type(s), and stats for the specified pokemon')
  .addStringOption(option => 
    option.setName('name')
    .setDescription('The name of the pokemon.')
    .setRequired(true)),
  async execute (interaction) {
    const pokemonName = interaction.options.getString('name');
    const pokemonInfo = await getPokemonInfo(pokemonName.toLowerCase());
    const { abilities, stats, types } = pokemonInfo;
    const replies = [];
    replies.push(`Pokemon: ${pokemonName}`);
    const abilitiesList = [];
    abilities.forEach((ability) => {
      abilitiesList.push(ability.ability.name);
    });
    replies.push(`Abilities: ${abilitiesList.join(', ')}`);
    const typeList = [];
    types.forEach((type) => {
      typeList.push(type.type.name);
    });
    replies.push(`Types: ${typeList.join(', ')}`);
    stats.forEach((stat) => {
      replies.push(`${stat.stat.name.toUpperCase()}: ${stat.base_stat}`);
    });
    await interaction.reply(`${replies.join('\n')}`);
  },
};
