require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("dm")
    .setDescription("Send DM to user")
    .addUserOption(option =>
      option.setName("user").setDescription("User").setRequired(true))
    .addStringOption(option =>
      option.setName("message").setDescription("Message").setRequired(true)),

  new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send message to channel")
    .addChannelOption(option =>
      option.setName("channel").setDescription("Channel").setRequired(true))
    .addStringOption(option =>
      option.setName("message").setDescription("Message").setRequired(true)),
];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("⏳ Registering commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Commands registered!");
  } catch (error) {
    console.error(error);
  }
})();
