const fetchPokemonInfo = require('./pokeAPIWrapper/pokemonInfo.js');

async function getPokemonInfo(pokemonName) {
  const pokemonInfo = await fetchPokemonInfo(pokemonName.toLowerCase());
  if (!pokemonInfo) {
    return `${pokemonName} is not a valid pokemon.`;
  }
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
  return replies.join('\n');
}

module.exports = {
  getPokemonInfo,
};
