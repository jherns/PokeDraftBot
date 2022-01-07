const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('swap')
    .setDescription('Swap a pokemon onto your team')
    .addStringOption((option) =>
      option
        .setName('newPokemon')
        .setDescription('The pokemon you want on your team.')
        .setRequired(true)
    ).addStringOption((option) =>
    option
      .setName('oldPokemon')
      .setDescription('The pokemon you want to drop.')
      .setRequired(true)
  ),
  async execute(interaction) {
    await interaction.reply(
      await swap(
        interaction.guildId,
        interaction.member.user.id,
        interaction.options.getString('newPokemon').toLowerCase(),
        interaction.options.getString('oldPokemon').toLowerCase()
      )
    );
  },
};
