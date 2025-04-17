# PokeDraftBot

A containerized Discord bot to facilitate a draft Pokémon league.

## Features

- Drafting pokemon `/draft`
- Swapping pokemon `/swap`
- Looking up information about any pokemon `/pokemon`
- Get a summary of all of a user's pokemon `/team`
- Containerized for easy deployment.

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- A Discord bot token (create one at [Discord Developer Portal](https://discord.com/developers/applications))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jherns/PokeDraftBot.git
   cd PokeDraftBot
   ```

2. Create a .env file in the root directory. Add the following environment variables:

   ```
   TOKEN=<your-discord-bot-token>
   CLIENT_ID=<your-discord-client-id>
   GUILD_ID=<your-discord-guild-id>
   ```

   Replace `<your-discord-bot-token>`, `<your-discord-client-id>`, and `<your-discord-guild-id>` with the appropriate values for your bot.

3. Build the bot using Docker Compose:

   ```bash
   docker-compose up
   ```

4. You can stop the bot with:
   ```bash
   docker-compose down
   ```

These steps will run the bot using local MySQL container. To connect to a hosted database, add values for `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DB` in your .env file and run `npm start`
