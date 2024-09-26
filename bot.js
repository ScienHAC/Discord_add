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
    const channels = interaction.guild.channels.cache.filter(channel => channel.isText() || channel.isVoice());

    let successes = 0;
    let failures = [];
    
    for (const channel of channels.values()) {
      const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
      const userMember = await interaction.guild.members.fetch(user.id);
      
      console.log(`Checking permissions for bot in channel: ${channel.name}`);
      console.log(`Bot Permissions: ${botMember.permissionsIn(channel).toArray()}`);
      console.log(`User Permissions: ${userMember.permissionsIn(channel).toArray()}`);
      
      try {
        if (channel.isText()) {
          await channel.permissionOverwrites.edit(user, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
          });
        } else if (channel.isVoice()) {
          await channel.permissionOverwrites.edit(user, {
            VIEW_CHANNEL: true,
            CONNECT: true,
          });
        }
        successes++;
      } catch (error) {
        console.error(`Failed in channel ${channel.name}:`, error);
        failures.push(`Failed in channel ${channel.name}: ${error.message}`);
      }
    }

    // Respond to the interaction
    if (successes > 0) {
      await interaction.reply(`User ${user.tag} has been added to ${successes} channels.`);
    } else {
      await interaction.reply(`User ${user.tag} has been added to 0 channels.\n` + failures.join('\n'));
    }
  }
});


// Login to Discord with your bot's token
client.login(TOKEN);
