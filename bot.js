const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config(); // Ensure dotenv is included to load environment variables

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
    description: 'Add a user to all channels in the server',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to add (ID or @mention)',
        required: true,
      },
    ],
  },
  {
    name: 'remove-user',
    description: 'Remove a user from a specific channel',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to remove (ID or @mention)',
        required: true,
      },
      {
        type: 7, // CHANNEL type
        name: 'channel',
        description: 'The channel to remove the user from',
        required: true,
      },
    ],
  },
  {
    name: 'remove-user-all',
    description: 'Remove a user from all channels in the server',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to remove (ID or @mention)',
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
    
    // Get all channels in the guild
    const guild = interaction.guild;
    const channels = guild.channels.cache;

    try {
      // Loop through each channel and grant necessary permissions
      channels.forEach(async (channel) => {
        if (channel.isTextBased()) {
          await channel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true,
            [PermissionsBitField.Flags.SendMessages]: true,
          });
        } else if (channel.isVoiceBased()) {
          await channel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true,
            [PermissionsBitField.Flags.Connect]: true,
            [PermissionsBitField.Flags.Speak]: true,
          });
        } else if (channel.type === 15) { // Forum channels
          await channel.permissionOverwrites.edit(user, {
            [PermissionsBitField.Flags.ViewChannel]: true,
            [PermissionsBitField.Flags.SendMessagesInThreads]: true,
          });
        }
      });

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully added to all channels.`);
    } catch (error) {
      console.error('Error adding user to all channels:', error);
      await interaction.reply('There was an error while trying to add the user to all channels.');
    }
  } else if (commandName === 'remove-user') {
    // Get the user and channel options from the command
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is valid
    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      // Remove the user from the specific channel by deleting their permission overwrite
      await channel.permissionOverwrites.delete(user);

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully removed from channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error removing user from the channel:', error);
      await interaction.reply('There was an error while trying to remove the user from the channel.');
    }
  } else if (commandName === 'remove-user-all') {
    // Get the user option from the command
    const user = interaction.options.getUser('usr');
    
    // Get all channels in the guild
    const guild = interaction.guild;
    const channels = guild.channels.cache;

    try {
      // Loop through each channel and remove permission overwrites for the user
      channels.forEach(async (channel) => {
        await channel.permissionOverwrites.delete(user);
      });

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully removed from all channels.`);
    } catch (error) {
      console.error('Error removing user from all channels:', error);
      await interaction.reply('There was an error while trying to remove the user from all channels.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);




/*const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config(); // Ensure dotenv is included to load environment variables

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
        type: 6, // USER type
        name: 'usr',
        description: 'The user to add (ID or @mention)',
        required: true,
      },
      {
        type: 7, // CHANNEL type
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
        type: 6, // USER type
        name: 'usr',
        description: 'The user to remove (ID or @mention)',
        required: true,
      },
      {
        type: 7, // CHANNEL type
        name: 'channel',
        description: 'The channel to remove the user from',
        required: true,
      },
    ],
  },
  {
    name: 'remove-usr',
    description: 'Remove a user by ID from a specific channel',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to remove by ID',
        required: true,
      },
      {
        type: 7, // CHANNEL type
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
    // Get the user and channel options from the command
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is valid
    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      // Add the user to the specified channel by editing permissions
      if (channel.isTextBased()) {
        await channel.permissionOverwrites.edit(user, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.SendMessages]: true,
        });
      } else if (channel.isVoiceBased()) {
        await channel.permissionOverwrites.edit(user, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.Connect]: true,
          [PermissionsBitField.Flags.Speak]: true,
        });
      } else if (channel.type === 15) { // Forum channels
        await channel.permissionOverwrites.edit(user, {
          [PermissionsBitField.Flags.ViewChannel]: true,
          [PermissionsBitField.Flags.SendMessagesInThreads]: true,
        });
      } else {
        await channel.permissionOverwrites.edit(user, {
          [PermissionsBitField.Flags.ViewChannel]: true,
        });
      }

      // Confirm the action in the reply
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully added to channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error adding user to channel:', error);
      await interaction.reply('There was an error while trying to add the user to the channel.');
    }
  } else if (commandName === 'remove-user' || commandName === 'remove-usr') {
    // Get the user and channel options from the command
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    // Check if the channel is valid
    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      // Remove the user from the specified channel by deleting their permission overwrite
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
*/
