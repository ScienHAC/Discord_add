const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const express = require('express');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const PORT = process.env.PORT || 3000;

// Initialize Express app for keeping the bot alive
const app = express();

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Define slash commands
const commands = [
  {
    name: 'add-user',
    description: 'Add a user or role to all channels in the server',
    options: [
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to add (ID or @mention)',
        required: false,
      },
      {
        type: 8, // ROLE type
        name: 'role',
        description: 'The role to add',
        required: false,
      },
    ],
  },
  {
    name: 'remove-user',
    description: 'Remove a user or role from a specific channel',
    options: [
      {
        type: 7, // CHANNEL type
        name: 'channel',
        description: 'The channel to remove from',
        required: true,
      },
      {
        type: 6, // USER type
        name: 'usr',
        description: 'The user to remove (ID or @mention)',
        required: false,
      },
      {
        type: 8, // ROLE type
        name: 'role',
        description: 'The role to remove',
        required: false,
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

// Initialize REST API for registering slash commands
const rest = new REST({ version: '9' }).setToken(TOKEN);

// Register slash commands when bot starts
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Register commands for each guild the bot is in
  try {
    console.log('Started refreshing application (/) commands.');

    // For each guild the bot is in
    client.guilds.cache.forEach(async (guild) => {
      try {
        await rest.put(
          Routes.applicationGuildCommands(CLIENT_ID, guild.id),
          { body: commands }
        );
        console.log(`Registered commands for guild: ${guild.name}`);
      } catch (err) {
        console.error(`Error registering commands for guild ${guild.name}:`, err);
      }
    });

    console.log('Successfully refreshed application commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }

  // Start Express server after bot is ready
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
});

// Command handling
client.on('interactionCreate', async (interaction) => {
  // Ignore non-command interactions
  if (!interaction.isCommand()) return;

  // Acknowledge the interaction immediately to prevent "Bot is not responding" errors
  await interaction.deferReply();

  const { commandName } = interaction;

  try {
    if (commandName === 'add-user') {
      const user = interaction.options.getUser('usr');
      const role = interaction.options.getRole('role');

      // Check if at least one option is provided
      if (!user && !role) {
        return await interaction.editReply('You must provide either a user or a role to add.');
      }

      const guild = interaction.guild;
      const channels = guild.channels.cache;

      // Process each channel with a delay to avoid rate limits
      for (const channel of channels.values()) {
        try {
          // Add user permissions
          if (user) {
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

          // Add role permissions
          if (role) {
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

          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error adding permissions to channel ${channel.name}:`, error);
        }
      }

      // Complete the response
      await interaction.editReply(`Successfully added permissions to all channels for ${user ? `user ${user.tag}` : ''}${user && role ? ' and ' : ''}${role ? `role ${role.name}` : ''}.`);

    } else if (commandName === 'remove-user') {
      const user = interaction.options.getUser('usr');
      const role = interaction.options.getRole('role');
      const channel = interaction.options.getChannel('channel');

      // Check if at least one option is provided
      if (!user && !role) {
        return await interaction.editReply('You must provide either a user or a role to remove.');
      }

      try {
        if (user) {
          await channel.permissionOverwrites.delete(user);
        }

        if (role) {
          await channel.permissionOverwrites.delete(role);
        }

        await interaction.editReply(`Successfully removed permissions from channel ${channel.name} for ${user ? `user ${user.tag}` : ''}${user && role ? ' and ' : ''}${role ? `role ${role.name}` : ''}.`);
      } catch (error) {
        console.error('Error removing permissions:', error);
        await interaction.editReply('There was an error removing permissions. Make sure I have the necessary permissions to manage channel permissions.');
      }

    } else if (commandName === 'remove-user-all') {
      const user = interaction.options.getUser('usr');
      const guild = interaction.guild;
      const channels = guild.channels.cache;

      if (!user) {
        return await interaction.editReply('You must provide a user to remove from all channels.');
      }

      // Process each channel with a delay to avoid rate limits
      for (const channel of channels.values()) {
        try {
          await channel.permissionOverwrites.delete(user);

          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`Error removing user from channel ${channel.name}:`, error);
        }
      }

      await interaction.editReply(`Successfully removed permissions for user ${user.tag} from all channels.`);
    }
  } catch (error) {
    console.error('Error handling command:', error);
    // Make sure we respond even if there's an error
    if (interaction.deferred && !interaction.replied) {
      await interaction.editReply('There was an error executing the command. Please check the bot permissions and try again.');
    }
  }
});

// Express routes for keeping the bot alive on hosting platforms
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord with the bot token
client.login(TOKEN).catch(console.error);

