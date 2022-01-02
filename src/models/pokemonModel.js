const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const waitPort = require('wait-port');

let con;

async function init() {
  const host = process.env.MYSQL_HOST;
  con = mysql.createConnection({
    host,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    multipleStatements: true,
  });

  await waitPort({ host, port: 3306 });

  con.connect((error) => {
    if (error) {
      console.log('Error connecting to DB');
      return;
    }
    console.log('Connection established');
  });

  const sql = fs.readFileSync(path.join(__dirname, '/init_db.sql')).toString();
  await con.query(sql, (error, results) => {
    if (error) {
      throw error;
    } else {
      console.log('DB initialized.');
    }
  });
}

async function teardown() {
  await con.end((error) => {
    if (error) {
      throw error;
    } else {
      console.log('Disconnected from DB');
    }
  });
}

async function validMon(pokemonName) {
  await con.query(
    'SELECT count(*) AS pokemonCount FROM pokemon WHERE name = ?',
    [pokemonName],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        return results[0].pokemonCount === 1;
      }
    }
  );
}

async function isDrafted(pokemonName) {
  await con.query(
    'SELECT count(*) AS pokemonCount FROM teams WHERE pokemon = ?',
    [pokemonName],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        return results[0].pokemonCount === 1;
      }
    }
  );
}

async function getTier(pokemonName) {
  await con.query(
    'SELECT tier FROM pokemon WHERE name = ?',
    [pokemonName],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        return results[0].tier;
      }
    }
  );
}

async function getUserTiers(serverId, userId) {
  await con.query(
    'SELECT tier FROM teams WHERE serverId = ?, userId = ?',
    [serverId, userId],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        return results;
      }
    }
  );
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
  await con.query(
    'INSERT INTO teams (serverId, userId, pokemon, tier) VALUES (? ? ? ?)',
    [serverId, userId, pokemonName, tier],
    (error, results) => {
      if (error) {
        throw error;
      } else {
        return `${pokemonName} drafted in the tier ${tier}`;
      }
    }
  );
}

async function draft(serverId, userId, pokemonName) {
  if (!(await validMon(pokemonName))) {
    return 'This is not a valid pokemon';
  }
  if (await isDrafted(pokemonName)) {
    return 'This pokemon has already been drafted';
  }
  const tier = await getTier(pokemonName);
  const userTiers = await getUserTiers(serverId, userId);
  if (userTiers.length === 10) {
    return 'You have already drafted 10 pokemon.';
  }
  const draftTier = calculatePokemonDraftTier(userTiers, tier);
  if (!draftTier) {
    return `You do not have an available draft spot for a pokemon of tier ${tier}`;
  }
  return await insertPokemon(serverId, userId, pokemonName, tier);
}

module.exports = {
  init,
  teardown,
  draft,
};
