require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
  ChannelType,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // 🔒 Only allow admins (change if needed)
  if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({
      content: "❌ You don't have permission to use this command.",
      ephemeral: true
    });
  }

  // =========================
  // 📩 DM COMMAND
  // =========================
  if (commandName === "dm") {
    const user = interaction.options.getUser("user");
    const message = interaction.options.getString("message");

    if (!user || !message) {
      return interaction.reply({
        content: "❌ Missing user or message.",
        ephemeral: true
      });
    }

    try {
      await user.send(message);

      await interaction.reply({
        content: `✅ DM sent to ${user.tag}`,
        ephemeral: true
      });

    } catch (error) {
      console.error("DM Error:", error);

      let errorMsg = "❌ Failed to DM user.";
      if (error.code === 50007) {
        errorMsg = "❌ Cannot DM this user (DMs disabled or bot blocked).";
      }

      await interaction.reply({
        content: errorMsg,
        ephemeral: true
      });
    }
  }

  // =========================
  // 📢 SEND MESSAGE COMMAND
  // =========================
  else if (commandName === "send") {
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    if (!channel || !message) {
      return interaction.reply({
        content: "❌ Missing channel or message.",
        ephemeral: true
      });
    }

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "❌ Must be a text channel.",
        ephemeral: true
      });
    }

    // 🔒 Check bot permissions in that channel
    const botPermissions = channel.permissionsFor(interaction.client.user);

    if (!botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({
        content: "❌ I don't have permission to send messages in that channel.",
        ephemeral: true
      });
    }

    try {
      await channel.send(message);

      await interaction.reply({
        content: `✅ Message sent in #${channel.name}`,
        ephemeral: true
      });

    } catch (error) {
      console.error("Send Error:", error);

      await interaction.reply({
        content: "❌ Failed to send message.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
