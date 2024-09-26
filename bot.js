const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID; // Client ID from the Developer Portal

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Register the slash command globally (can be used across any guild where the bot is invited)
const commands = [
  {
    name: 'add-user',
    description: 'Add a user to private and public channels',
    options: [
      {
        type: 6, // USER type (user ID)
        name: 'usr',
        description: 'The user to add',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

// Register the slash command globally (across all servers where the bot is added)
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// When the bot is ready
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Command handling
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'add-user') {
    const user = interaction.options.getUser('usr');
    const guild = interaction.guild; // This detects the guild (server) automatically

    // Fetch all channels in the guild (server)
    const channels = await guild.channels.fetch();

    try {
      // Add the user to all available text channels
      for (const [channelId, channel] of channels) {
        if (channel.isTextBased()) {
          await channel.permissionOverwrites.edit(user, {
            VIEW_CHANNEL: true, // Grant the user permission to view the channel
          });
          console.log(`Added ${user.tag} to channel ${channel.name}`);
        }
      }

      // Respond to the interaction that the user was added
      await interaction.reply(`User ${user.tag} added to all text channels.`);
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error while trying to add the user.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);
