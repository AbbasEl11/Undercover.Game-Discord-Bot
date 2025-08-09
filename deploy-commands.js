// deploy-commands.js
const { REST, Routes } = require("discord.js");
// Import bot client ID, guild ID, and token from config file
const { clientId, guildId, token } = require("./config.json");

// Define Slash Commands for the bot
const commands = [
  {
    name: "start",
    description: "Starts a new round of Undercover.",
    options: [
      {
        name: "game",
        description: "Which game should be started?",
        type: 3, // String type
        required: true,
        choices: [{ name: "Undercover", value: "undercover" }],
      },
    ],
  },
  {
    name: "join",
    description: "Joins the current Undercover game.",
  },
  {
    name: "play",
    description: "The host starts the Undercover game.",
  },
  {
    name: "vote",
    description: "The host starts the voting phase.",
  },
  {
    name: "endvote",
    description: "The host ends the voting and tallies the votes.",
  },
  {
    name: "endgame",
    description: "The host ends the current game prematurely.",
  },
];

// Create an instance of the REST module to interact with the Discord API
const rest = new REST({ version: "10" }).setToken(token);

// Self-executing asynchronous function to register the commands
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // Register commands for a specific guild (server) which is faster for development
    // To register globally (for all servers the bot is in), use Routes.applicationCommands(clientId)
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // Catch and log any errors during command registration
    console.error(error);
  }
})();
