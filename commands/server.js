module.exports = {
  name: 'server',
  description: 'Displays server name',
  execute(message) {
    message.channel.send(`This server's name is: ${message.guild.name}`);
  },
};
