const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const waitPort = require('wait-port');

let con;

async function init() {
  const host = process.env.MYSQL_HOST;
  await waitPort({ host, port: 3306 });
  try {
    con = await mysql.createConnection({
      host,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      multipleStatements: true,
    });
    console.log('Connection established');
  } catch (error) {
    console.log('Error connecting to DB');
  }

  try {
    const sql = fs
      .readFileSync(path.join(__dirname, '/init_db.sql'))
      .toString();
    await con.query(sql);
    console.log('DB initialized.');
  } catch (error) {
    throw error;
  }
}

async function teardown() {
  try {
    await con.end();
    console.log('Disconnected from DB');
  } catch (error) {
    throw error;
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
    throw error;
  }
}

async function getTier(pokemonName) {
  try {
    const [rows] = await con.query('SELECT tier FROM pokemon WHERE name = ?', [
      pokemonName,
    ]);
    return rows[0]?.tier;
  } catch (error) {
    throw error;
  }
}

async function getUserTiers(serverId, userId) {
  try {
    const [rows] = await con.query(
      'SELECT tier FROM teams WHERE serverId = ? AND userId = ?',
      [serverId, userId]
    );
    return rows.map((row) => row.tier);
  } catch (error) {
    throw error;
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
    throw error;
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
      break;
    case 'OU2':
      return calcOU2Tier(userTiers);
      break;
    case 'UU':
      return calcUUTier(userTiers);
      break;
    case 'RU':
      return calcRUTier(userTiers);
      break;
    case 'NU':
      return calcNUTier(userTiers);
      break;
    case 'PU':
      return calcPUTier(userTiers);
      break;
    default:
      return null;
      break;
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
    throw error;
  }
}

async function draft(serverId, userId, pokemonName) {
  const tier = await getTier(pokemonName);
  if (!tier) {
    return 'This is not a valid pokemon';
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

module.exports = {
  init,
  teardown,
  draft,
  getUserPokemon,
};
