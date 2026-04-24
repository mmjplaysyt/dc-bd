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

  // 🔒 Admin only (change if needed)
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
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser("user");
    const message = interaction.options.getString("message");

    if (!user || !message) {
      return interaction.editReply("❌ Missing user or message.");
    }

    try {
      await user.send(message);

      await interaction.editReply(`✅ DM sent to ${user.tag}`);

    } catch (error) {
      console.error("DM Error:", error);

      if (error.code === 50007) {
        await interaction.editReply("❌ Cannot DM this user (DMs off / blocked).");
      } else {
        await interaction.editReply("❌ Failed to DM user.");
      }
    }
  }

  // =========================
  // 📢 SEND COMMAND
  // =========================
  else if (commandName === "send") {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    if (!channel || !message) {
      return interaction.editReply("❌ Missing channel or message.");
    }

    if (channel.type !== ChannelType.GuildText) {
      return interaction.editReply("❌ Must be a text channel.");
    }

    // 🔒 Check bot permissions
    const botPerms = channel.permissionsFor(interaction.client.user);

    if (!botPerms.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.editReply("❌ I don't have permission in that channel.");
    }

    try {
      await channel.send(message);

      await interaction.editReply(`✅ Message sent in #${channel.name}`);

    } catch (error) {
      console.error("Send Error:", error);
      await interaction.editReply("❌ Failed to send message.");
    }
  }
});

// ❗ Catch unexpected errors (prevents crashes)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

client.login(process.env.DISCORD_BOT_TOKEN);
