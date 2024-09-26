const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Register the slash command globally
const commands = [
  {
    name: 'add-user',
    description: 'Add a user to a specific channel',
    options: [
      {
        type: 6, // USER type (user ID)
        name: 'usr',
        description: 'The user to add',
        required: true,
      },
      {
        type: 7, // CHANNEL type (channel ID)
        name: 'channel',
        description: 'The channel to add the user to',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

// Register the slash command globally
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// When the bot is ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Command handling
const { PermissionsBitField } = require('discord.js');

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'add-user') {
    // Get the user option from the command
    const user = interaction.options.getUser('usr');
    // Get the channel option from the command
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is valid (it should exist)
    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    // Log the channel type for debugging
    console.log(`Attempting to add user ${user.tag} to channel: ${channel.name} (Type: ${channel.type})`);

    try {
      // Check the bot's permissions in the channel
      const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
      console.log(`Bot Permissions in channel ${channel.name}:`, botMember.permissionsIn(channel).toArray());

      // Add the user to the specified channel by editing permissions
      if (channel.type === 0) { // 0 is for text channels
        // For text-based channels (including forums, announcements), grant VIEW_CHANNEL and SEND_MESSAGES
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
          SEND_MESSAGES: PermissionsBitField.Flags.SendMessages,
        });
      } else if (channel.type === 2) { // 2 is for voice channels
        // For voice-based channels, grant VIEW_CHANNEL and CONNECT
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
          CONNECT: PermissionsBitField.Flags.Connect,
          // Optional for stage channels, grant REQUEST_TO_SPEAK if desired
          REQUEST_TO_SPEAK: PermissionsBitField.Flags.RequestToSpeak,
        });
      } else if (channel.type === 15) { // 15 is for forum channels in discord.js v14
        // For forum channels, grant VIEW_CHANNEL and SEND_MESSAGES_IN_THREADS
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
          SEND_MESSAGES_IN_THREADS: PermissionsBitField.Flags.SendMessagesInThreads,
        });
      } else {
        // For any other channels or categories, just grant VIEW_CHANNEL
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
        });
      }

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully added to channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error adding user to channel:', error);
      await interaction.reply('There was an error while trying to add the user to the channel. Details: ' + error.message);
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);
