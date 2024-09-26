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
    const user = interaction.options.getUser('usr');
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
        await interaction.reply('Please provide a valid channel.');
        return;
    }

    try {
        // Define the role name and permissions
        const roleName = `TempRoleForUser_${user.username}`;
        const permissions = [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.RequestToSpeak,
        ];

        // Check if the role already exists
        let role = interaction.guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            // Create a new role
            role = await interaction.guild.roles.create({
                name: roleName,
                permissions: permissions,
                reason: `Temporary role for ${user.tag} to access ${channel.name}`,
            });
        }

        // Add the role to the user
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.add(role);

        // Set channel permissions for the role
        await channel.permissionOverwrites.edit(role, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
            CONNECT: true,
            REQUEST_TO_SPEAK: true,
        });

        // Confirm the action in the reply
        await interaction.reply(`User ${user.tag} has been successfully added to channel: ${channel.name}.`);
    } catch (error) {
        console.error('Error adding user to channel:', error);
        await interaction.reply('There was an error while trying to add the user to the channel. Please check the bot permissions and user roles.');
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
