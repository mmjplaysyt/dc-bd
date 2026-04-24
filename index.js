require("dotenv").config();

const { Client, GatewayIntentBits, Events, ChannelType } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // ✅ DM COMMAND
  if (commandName === "dm") {
    const user = interaction.options.getUser("user");
    const message = interaction.options.getString("message");

    try {
      await user.send(message);

      await interaction.reply({
        content: `✅ DM sent to ${user.tag}`,
        ephemeral: true,
      });

    } catch (error) {
      await interaction.reply({
        content: `❌ Failed to DM ${user.tag} (maybe DMs off / blocked)`,
        ephemeral: true,
      });
    }
  }

  // ✅ SEND MESSAGE TO CHANNEL
  if (commandName === "send") {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "❌ Must be a text channel",
        ephemeral: true,
      });
    }

    try {
      await channel.send(message);

      await interaction.reply({
        content: `✅ Message sent in #${channel.name}`,
        ephemeral: true,
      });

    } catch (error) {
      await interaction.reply({
        content: `❌ Failed to send message`,
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
