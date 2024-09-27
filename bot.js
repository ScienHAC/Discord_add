/*const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

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
    const user = interaction.options.getUser('usr');
    const guild = interaction.guild;
    const channels = guild.channels.cache;

    let i = 0;
    try {
      channels.forEach(async (channel) => {
        setTimeout(async () => {
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
        }, i * 1000); // Add delay between channel permission edits
        i++;
      });

      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully added to all channels.`);
    } catch (error) {
      console.error('Error adding user to channels:', error);
      await interaction.reply('There was an error while trying to add the user to all channels.');
    }
  } else if (commandName === 'remove-user') {
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      await channel.permissionOverwrites.delete(user);
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully removed from channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error removing user from the channel:', error);
      await interaction.reply('There was an error while trying to remove the user from the channel.');
    }
  } else if (commandName === 'remove-user-all') {
    const user = interaction.options.getUser('usr');
    const guild = interaction.guild;
    const channels = guild.channels.cache;

    let i = 0;
    try {
      channels.forEach(async (channel) => {
        setTimeout(async () => {
          await channel.permissionOverwrites.delete(user);
        }, i * 1000); // Add delay between channel permission deletions
        i++;
      });

      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully removed from all channels.`);
    } catch (error) {
      console.error('Error removing user from all channels:', error);
      await interaction.reply('There was an error while trying to remove the user from all channels.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);*/



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
    description: 'Add a user or role to all channels in the server',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to add (ID or @mention)',
        required: false, // Make it optional
      },
      {
        type: 8, // ROLE type
        name: 'role',
        description: 'The role to add',
        required: false, // Make it optional
      },
    ],
  },
  {
    name: 'remove-user',
    description: 'Remove a user or role from a specific channel',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to remove (ID or @mention)',
        required: false, // Make it optional
      },
      {
        type: 8, // ROLE type
        name: 'role',
        description: 'The role to remove',
        required: false, // Make it optional
      },
      {
        type: 7, // CHANNEL type
        name: 'channel',
        description: 'The channel to remove from',
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
    const user = interaction.options.getUser('usr');
    const role = interaction.options.getRole('role');
    const guild = interaction.guild;
    const channels = guild.channels.cache;

    let i = 0;
    try {
      channels.forEach(async (channel) => {
        setTimeout(async () => {
          if (user) {
            // Handle adding user permissions
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
          }

          if (role) {
            // Handle adding role permissions
            if (channel.isTextBased()) {
              await channel.permissionOverwrites.edit(role, {
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.SendMessages]: true,
              });
            } else if (channel.isVoiceBased()) {
              await channel.permissionOverwrites.edit(role, {
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.Connect]: true,
                [PermissionsBitField.Flags.Speak]: true,
              });
            } else if (channel.type === 15) { // Forum channels
              await channel.permissionOverwrites.edit(role, {
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.SendMessagesInThreads]: true,
              });
            }
          }
        }, i * 1000); // Add delay between channel permission edits
        i++;
      });

      await interaction.reply(`User ${user ? user.tag : 'N/A'} and role ${role ? role.name : 'N/A'} have been successfully added to all channels.`);
    } catch (error) {
      console.error('Error adding user or role to channels:', error);
      await interaction.reply('There was an error while trying to add the user or role to all channels.');
    }
  } else if (commandName === 'remove-user') {
    const user = interaction.options.getUser('usr');
    const role = interaction.options.getRole('role');
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      if (user) {
        // Remove user from channel
        await channel.permissionOverwrites.delete(user);
      }

      if (role) {
        // Remove role from channel
        await channel.permissionOverwrites.delete(role);
      }

      await interaction.reply(`User ${user ? user.tag : 'N/A'} and role ${role ? role.name : 'N/A'} have been successfully removed from channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error removing user or role from the channel:', error);
      await interaction.reply('There was an error while trying to remove the user or role from the channel.');
    }
  } else if (commandName === 'remove-usr') {
    // Handle removing user by ID
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply('Please provide a valid channel.');
      return;
    }

    try {
      await channel.permissionOverwrites.delete(user);
      await interaction.reply(`User ${user.tag} (ID: ${user.id}) has been successfully removed from channel: ${channel.name} (ID: ${channel.id}).`);
    } catch (error) {
      console.error('Error removing user from channel:', error);
      await interaction.reply('There was an error while trying to remove the user from the channel.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);
