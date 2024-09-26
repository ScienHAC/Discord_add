/*const { Client, GatewayIntentBits } = require('discord.js');
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
    const guild = interaction.guild;

    // Fetch all channels in the guild
    const channels = await guild.channels.fetch();

    try {
      // Add the user to all available text channels
      for (const [channelId, channel] of channels) {
        if (channel.isTextBased()) {
          // Ensure the channel is manageable
          if (channel.permissionsFor(guild.me).has('MANAGE_CHANNELS')) {
            await channel.permissionOverwrites.edit(user, {
              VIEW_CHANNEL: true,
            });
            console.log(`Added ${user.tag} to channel ${channel.name}`);
          } else {
            console.log(`Bot lacks permission to edit channel: ${channel.name}`);
          }
        }
      }

      // Respond to the interaction that the user was added
      await interaction.reply(`User ${user.tag} added to all text channels.`);
    } catch (error) {
      console.error('Error adding user to channels:', error);
      await interaction.reply('There was an error while trying to add the user.');
    }
  }
});*/
const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { PermissionsBitField } = require('discord.js');
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

// Register the slash commands globally
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
  {
    name: 'remove-user',
    description: 'Remove a user from a specific channel',
    options: [
      {
        type: 6, // USER type (user ID)
        name: 'usr',
        description: 'The user to remove',
        required: true,
      },
      {
        type: 7, // CHANNEL type (channel ID)
        name: 'channel',
        description: 'The channel to remove the user from',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '9' }).setToken(TOKEN);

// Register the slash commands globally
(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
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

    try {
      // Add the user to the specified channel by editing permissions
      if (channel.isTextBased()) {
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
          SEND_MESSAGES: PermissionsBitField.Flags.SendMessages,
        });
      } else if (channel.isVoiceBased()) {
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
          CONNECT: PermissionsBitField.Flags.Connect,
          REQUEST_TO_SPEAK: PermissionsBitField.Flags.RequestToSpeak,
        });
      } else if (channel.type === 15) { // Forum channels
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
          SEND_MESSAGES_IN_THREADS: PermissionsBitField.Flags.SendMessagesInThreads,
        });
      } else {
        await channel.permissionOverwrites.edit(user, {
          VIEW_CHANNEL: PermissionsBitField.Flags.ViewChannel,
        });
      }

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully added to channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error adding user to channel:', error);
      await interaction.reply('There was an error while trying to add the user to the channel.');
    }
  } else if (commandName === 'remove-user') {
    // Get the user option from the command
    const user = interaction.options.getUser('usr');
    // Get the channel option from the command
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is valid (it should exist)
    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      // Remove the user from the specified channel by resetting their permissions
      await channel.permissionOverwrites.delete(user);

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully removed from channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error removing user from channel:', error);
      await interaction.reply('There was an error while trying to remove the user from the channel.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);


