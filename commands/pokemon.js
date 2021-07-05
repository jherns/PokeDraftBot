const getPokemonInfo = require('../pokeAPIWrapper/pokemonInfo.js');

module.exports = {
  name: 'pokemon',
  description: 'Information about the arguments provided.',
  args: true,
  execute: async (message, args) => {
    const pokemonInfo = await getPokemonInfo(args[0].toLowerCase());
    const { abilities, stats, types } = pokemonInfo;
    const messages = [];
    messages.push(`Pokemon: ${args[0]}`);
    const abilitiesList = [];
    abilities.forEach((ability) => {
      abilitiesList.push(ability.ability.name);
    });
    messages.push(`Abilities: ${abilitiesList.join(', ')}`);
    const typeList = [];
    types.forEach((type) => {
      typeList.push(type.type.name);
    });
    messages.push(`Types: ${typeList.join(', ')}`);
    stats.forEach((stat) => {
      messages.push(`${stat.stat.name.toUpperCase()}: ${stat.base_stat}`);
    });
    message.channel.send(`${messages.join('\n')}`);
  },
};
