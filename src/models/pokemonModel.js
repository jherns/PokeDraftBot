const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let con;

async function init() {
  try {
    con = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      multipleStatements: true,
    });
    console.log('Connection established');
  } catch (error) {
    console.log('Error connecting to DB');
    console.log(error);
  }

  try {
    const sql = fs
      .readFileSync(path.join(__dirname, '/init_db.sql'))
      .toString();
    await con.query(sql);
    console.log('DB initialized.');
  } catch (error) {
    console.log(error.message);
  }
}

async function teardown() {
  try {
    await con.end();
    console.log('Disconnected from DB');
  } catch (error) {
    console.log(error.message);
  }
}

async function isDrafted(pokemonName) {
  try {
    const [rows] = await con.query(
      'SELECT count(*) AS pokemonCount FROM teams WHERE pokemon = ?',
      [pokemonName]
    );
    return rows[0].pokemonCount > 0;
  } catch (error) {
    console.log(error.message);
  }
}

async function getTier(pokemonName) {
  try {
    const [rows] = await con.query('SELECT tier FROM pokemon WHERE name = ?', [
      pokemonName,
    ]);
    return rows[0]?.tier;
  } catch (error) {
    console.log(error.message);
  }
}

async function soundsLike(pokemonName) {
  try {
    const [rows] = await con.query(
      'SELECT name FROM pokemon WHERE name SOUNDS LIKE ?',
      [pokemonName]
    );
    return rows.map((row) => row.name);
  } catch (error) {
    console.log(error.message);
  }
}

async function recommendPokemon(pokemonName) {
  const pokemonRecommendations = await soundsLike(pokemonName);
  return pokemonRecommendations
    ? `${pokemonName} is not a valid pokemon. Did you mean ${pokemonRecommendations.join(
        ', '
      )}`
    : `${pokemonName} is not a valid pokemon.`;
}

async function getUserTiers(serverId, userId) {
  try {
    const [rows] = await con.query(
      'SELECT tier FROM teams WHERE serverId = ? AND userId = ?',
      [serverId, userId]
    );
    return rows.map((row) => row.tier);
  } catch (error) {
    console.log(error.message);
  }
}
async function getUserPokemon(serverId, userId) {
  try {
    const [rows] = await con.query(
      'SELECT pokemon FROM teams WHERE serverID = ? AND userId = ?',
      [serverId, userId]
    );
    return rows.map((row) => row.pokemon);
  } catch (error) {
    console.log(error.message);
  }
}

async function getUserPokemonTiers(serverId, userId) {
  try {
    const [rows] = await con.query(
      'SELECT pokemon, tier FROM teams WHERE serverId = ? AND userId = ?',
      [serverId, userId]
    );
    return rows;
  } catch (error) {
    console.log(error.message);
  }
}

function calcOU1Tier(userTiers) {
  return userTiers.includes('OU1') ? null : 'OU1';
}
function calcOU2Tier(userTiers) {
  return userTiers.includes('OU2') ? calcOU1Tier(userTiers) : 'OU2';
}
function calcUUTier(userTiers) {
  return userTiers.filter((v) => v === 'UU').length >= 2
    ? calcOU2Tier(userTiers)
    : 'UU';
}
function calcRUTier(userTiers) {
  return userTiers.filter((v) => v === 'RU').length >= 2
    ? calcUUTier(userTiers)
    : 'RU';
}
function calcNUTier(userTiers) {
  return userTiers.filter((v) => v === 'NU').length >= 2
    ? calcRUTier(userTiers)
    : 'NU';
}
function calcPUTier(userTiers) {
  return userTiers.filter((v) => v === 'PU').length >= 2
    ? calcNUTier(userTiers)
    : 'PU';
}
function calculatePokemonDraftTier(userTiers, tier) {
  switch (tier) {
    case 'OU1':
      return calcOU1Tier(userTiers);
    case 'OU2':
      return calcOU2Tier(userTiers);
    case 'UU':
      return calcUUTier(userTiers);
    case 'RU':
      return calcRUTier(userTiers);
    case 'NU':
      return calcNUTier(userTiers);
    case 'PU':
      return calcPUTier(userTiers);
    default:
      return null;
  }
}

async function insertPokemon(serverId, userId, pokemonName, tier) {
  try {
    await con.query(
      'INSERT INTO teams (serverId, userId, pokemon, tier) VALUES (?, ?, ?, ?)',
      [serverId, userId, pokemonName, tier]
    );
    return `${pokemonName} drafted in the tier ${tier}`;
  } catch (error) {
    console.log(error.message);
  }
}

async function swapPokemon(serverId, userId, newPokemon, oldPokemon) {
  try {
    await con.query(
      'UPDATE teams SET pokemon = ? WHERE serverId = ? AND userId = ? AND pokemon = ?',
      [newPokemon, serverId, userId, oldPokemon]
    );
  } catch (error) {
    console.log(error.message);
  }
}
async function draft(serverId, userId, pokemonName) {
  const tier = await getTier(pokemonName);
  if (!tier) {
    return recommendPokemon(pokemonName);
  }
  if (await isDrafted(pokemonName)) {
    return 'This pokemon has already been drafted';
  }
  const userTiers = await getUserTiers(serverId, userId);
  if (userTiers.length === 10) {
    return 'You have already drafted 10 pokemon.';
  }
  const draftTier = calculatePokemonDraftTier(userTiers, tier);
  if (!draftTier) {
    return `You do not have an available draft spot for a pokemon of tier ${tier}`;
  }
  return await insertPokemon(serverId, userId, pokemonName, draftTier);
}

async function swap(serverId, userId, newPokemon, oldPokemon) {
  const newPokemonTier = await getTier(newPokemon);
  if (newPokemonTier) {
    recommendPokemon(newPokemon);
  }
  if (await getTier(oldPokemon)) {
    recommendPokemon(oldPokemon);
  }
  const userPokemonTiers = await getUserPokemonTiers(serverId, userId);
  if (!userPokemonTiers.map((row) => row.pokemon).includes(oldPokemon)) {
    return `${oldPokemon} is not on your team.`;
  }
  if (await isDrafted(newPokemon)) {
    return `${newPokemon} is already drafted.`;
  }

  if (
    !calculatePokemonDraftTier(
      userPokemonTiers
        .filter((row) => row.pokemon !== oldPokemon)
        .map((row) => row.pokemon),
      newPokemonTier
    )
  ) {
    return `It is not valid for you to swap ${newPokemon} for ${oldPokemon}`;
  }
  await swapPokemon(serverId, userId, newPokemon, oldPokemon);
  return `Swapped ${oldPokemon} for ${newPokemon}`;
}

module.exports = {
  init,
  teardown,
  draft,
  getUserPokemon,
  swap,
};
