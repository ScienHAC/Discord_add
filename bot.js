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
    description: 'Add a user to all channels',
    options: [
      {
        type: 6, // USER type (user ID)
        name: 'usr',
        description: 'The user to add',
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
    const user = interaction.options.getUser('usr');
    const guild = interaction.guild;

    await interaction.deferReply();

    try {
      const channels = await guild.channels.fetch();

      let successCount = 0;
      let failureCount = 0;
      let failureReasons = [];

      for (const [channelId, channel] of channels) {
        try {
          if (!channel.permissionsFor(guild.me).has(PermissionsBitField.Flags.ManageChannels)) {
            failureCount++;
            failureReasons.push(`Bot lacks permission to manage channel: ${channel.name}`);
            continue; // Skip channels where bot can't manage permissions
          }

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

          successCount++;
        } catch (error) {
          failureCount++;
          failureReasons.push(`Failed in channel ${channel.name}: ${error.message}`);
        }
      }

      // If too many failures, limit the message size
      const failureMessage = failureReasons.slice(0, 10).join('\n'); // Show only the first 10 failures
      const remainingFailures = failureCount > 10 ? `\n...and ${failureCount - 10} more failures.` : '';

      await interaction.followUp(`User ${user.tag} (ID: ${user.id}) has been added to ${successCount} channels.\n${failureCount > 0 ? `${failureCount} failures (showing first 10):\n${failureMessage}${remainingFailures}` : ''}`);
    } catch (error) {
      console.error('Error adding user to all channels:', error);
      await interaction.followUp('There was an error while trying to add the user to all channels.');
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
      console.error('Error removing user from channel:', error);
      await interaction.reply('There was an error while trying to remove the user from the channel.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);
