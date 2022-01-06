const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { token } = require('../config.json');
const pokemonModel = require('./models/pokemonModel.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandFiles = fs
  .readdirSync('./src/commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // set a new item in the Collection
  // with the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log('Ready!');
});

// ... client setup (keep reading)

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    interaction.reply('there was an error trying to execute that command!');
  }
});

pokemonModel
  .init()
  .then(() => {
    client.login(token);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const gracefulShutdown = () => {
  pokemonModel
    .teardown()
    .catch(() => {})
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
