const { SlashCommandBuilder } = require('@discordjs/builders');
const { getPokemonInfo } = require('../utils.js');
const { getUserPokemon } = require('../models/pokemonModel.js');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('team')
    .setDescription('Get the pokemon for the provided team')
    .addUserOption((option) =>
      option
        .setName('owner')
        .setDescription('The owner of the team')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const teamPokemon = await getUserPokemon(
      interaction.guildId,
      interaction.options.getUser('owner').id
    );
    const pokemonReplies = [];
    for (const pokemon of teamPokemon) {
      pokemonReplies.push(await getPokemonInfo(pokemon));
    }
    await interaction.editReply({
      content: pokemonReplies.length
        ? pokemonReplies.join('\n\n')
        : `${
            interaction.options.getUser('owner').username
          } does not have a team.`,
    });
  },
};
