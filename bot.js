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

  // Inside the 'add-user' interaction handler
if (commandName === 'add-user') {
  const user = interaction.options.getUser('usr');
  const channel = interaction.options.getChannel('channel');

  if (!channel || !user) {
    await interaction.reply('Please provide a valid user and channel.');
    return;
  }

  try {
    const roleName = `TempRoleForUser_${user.id}`;
    let role = interaction.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      role = await interaction.guild.roles.create({
        name: roleName,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.Connect, // For voice channels if needed
          PermissionsBitField.Flags.RequestToSpeak, // For voice channels if needed
        ],
        reason: `Temporary role for ${user.tag} to access ${channel.name}`,
      });
    }

    const member = await interaction.guild.members.fetch(user.id);
    await member.roles.add(role);
    await channel.permissionOverwrites.edit(role, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
      CONNECT: true, // For voice channels if needed
      REQUEST_TO_SPEAK: true, // For voice channels if needed
    });

    await interaction.reply(`User ${user.tag} has been successfully added to channel: ${channel.name}.`);
  } catch (error) {
    console.error('Error adding user to channel:', error);
    await interaction.reply('There was an error while trying to add the user to the channel. Please check the bot permissions and user roles.');
  }
}else if (commandName === 'remove-user') {
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    if (!channel || !user) {
      await interaction.reply('Please provide a valid user and channel.');
      return;
    }

    try {
      const member = await interaction.guild.members.fetch(user.id);
      const roleName = `TempRoleForUser_${user.id}`;
      const role = interaction.guild.roles.cache.find(r => r.name === roleName);

      if (role) {
        await member.roles.remove(role);
      }

      await channel.permissionOverwrites.delete(role);

      await interaction.reply(`User ${user.tag} has been successfully removed from channel: ${channel.name}.`);
    } catch (error) {
      console.error('Error removing user from channel:', error);
      await interaction.reply('There was an error while trying to remove the user from the channel. Please check the bot permissions and user roles.');
    }
  }
});

// Login to Discord with your bot's token
client.login(TOKEN);
