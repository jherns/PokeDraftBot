const fetch = require('node-fetch');
const api = 'https://pokeapi.co/api/v2/pokemon/';

module.exports = async (pokemon) => {
  try {
    const response = await fetch(`${api}${pokemon}`);
    data = await response.json();
    return data;
  } catch (err) {
    console.log(err.message);
  }
};
