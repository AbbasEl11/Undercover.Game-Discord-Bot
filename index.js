/**
 * Undercover – Discord Party Game (German)
 * ---------------------------------------------------------------
 * A Discord bot for playing the German party game "Undercover".
 *
 * TECH STACK
 * - Node.js >= 18
 * - discord.js v14 (slash commands, components)
 * - Express (tiny keep‑alive endpoint for Replit/hosting)
 *
 * NOTES
 * - In‑game text is German by design; comments and docs are in English.
 * - Mr. White submits the final guess via DM using `!guess <word>`.
 * - Keep secrets out of Git (use config.example.json + .gitignore).
 */

// ---------------------------------------------------------------
// Imports & Basic Web Server (keep‑alive)
// ---------------------------------------------------------------
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");
const { token } = require("./config.json");

const app = express();
const port = process.env.PORT || 3000; // Hosting platforms often inject PORT

// Minimal keep‑alive endpoint so Replit/Render considers the process active
app.get("/", (req, res) => {
  res.send("Der Discord Bot läuft!");
});

app.listen(port, () => {
  console.log(`Webserver läuft auf Port ${port}`);
});

// ---------------------------------------------------------------
// Game Constants
// ---------------------------------------------------------------
const MIN_PLAYERS = 4; // Adjust for production; use lower value for testing

// Word pairs: civilians vs. undercover. Mr. White receives no word.
const DEFAULT_WORDS = [
  { civilian: "Apfel", undercover: "Birne" },
  { civilian: "Katze", undercover: "Hund" },
  { civilian: "Schule", undercover: "Uni" },
  { civilian: "Kaffee", undercover: "Tee" },
  { civilian: "Baum", undercover: "Busch" },
  { civilian: "Meer", undercover: "See" },
  { civilian: "Berg", undercover: "Hügel" },
  { civilian: "Buch", undercover: "Zeitung" },
  { civilian: "Stuhl", undercover: "Sessel" },
  { civilian: "Tisch", undercover: "Bank" },
  { civilian: "Lampe", undercover: "Kerze" },
  { civilian: "Auto", undercover: "Fahrrad" },
  { civilian: "Flugzeug", undercover: "Helikopter" },
  { civilian: "Straße", undercover: "Weg" },
  { civilian: "Haus", undercover: "Wohnung" },
  { civilian: "Fenster", undercover: "Tür" },
  { civilian: "Garten", undercover: "Park" },
  { civilian: "Blume", undercover: "Pflanze" },
  { civilian: "Regen", undercover: "Schnee" },
  { civilian: "Sonne", undercover: "Mond" },
  { civilian: "Tag", undercover: "Nacht" },
  { civilian: "Warm", undercover: "Heiß" },
  { civilian: "Kalt", undercover: "Kühl" },
  { civilian: "Schnell", undercover: "Rasch" },
  { civilian: "Langsam", undercover: "Träge" },
  { civilian: "Glücklich", undercover: "Fröhlich" },
  { civilian: "Traurig", undercover: "Niedergeschlagen" },
  { civilian: "Groß", undercover: "Klein" },
  { civilian: "Weit", undercover: "Nah" },
  { civilian: "Gerade", undercover: "Krumm" },
  { civilian: "Hell", undercover: "Dunkel" },
  { civilian: "Leise", undercover: "Laut" },
  { civilian: "Reich", undercover: "Arm" },
  { civilian: "Süß", undercover: "Sauer" },
  { civilian: "Bitter", undercover: "Scharf" },
  { civilian: "Wasser", undercover: "Saft" },
  { civilian: "Milch", undercover: "Joghurt" },
  { civilian: "Brot", undercover: "Brötchen" },
  { civilian: "Fleisch", undercover: "Wurst" },
  { civilian: "Fisch", undercover: "Garnelen" },
  { civilian: "Reis", undercover: "Nudeln" },
  { civilian: "Kartoffel", undercover: "Pommes" },
  { civilian: "Käse", undercover: "Butter" },
  { civilian: "Ei", undercover: "Omlett" },
  { civilian: "Honig", undercover: "Sirup" },
  { civilian: "Salz", undercover: "Pfeffer" },
  { civilian: "Zucker", undercover: "Süßstoff" },
  { civilian: "Gabel", undercover: "Löffel" },
  { civilian: "Messer", undercover: "Schere" },
  { civilian: "Tasse", undercover: "Becher" },
  { civilian: "Teller", undercover: "Schale" },
  { civilian: "Herd", undercover: "Ofen" },
  { civilian: "Kühlschrank", undercover: "Gefriertruhe" },
  { civilian: "Waschmaschine", undercover: "Trockner" },
  { civilian: "Computer", undercover: "Laptop" },
  { civilian: "Handy", undercover: "Tablet" },
  { civilian: "Maus", undercover: "Tastatur" },
  { civilian: "Kamera", undercover: "Fotoapparat" },
  { civilian: "Fernseher", undercover: "Monitor" },
  { civilian: "Radio", undercover: "Lautsprecher" },
  { civilian: "Uhr", undercover: "Wecker" },
  { civilian: "Ring", undercover: "Kette" },
  { civilian: "Hut", undercover: "Mütze" },
  { civilian: "Schuh", undercover: "Stiefel" },
  { civilian: "Socke", undercover: "Handschuh" },
  { civilian: "Hemd", undercover: "Bluse" },
  { civilian: "Hose", undercover: "Rock" },
  { civilian: "Mantel", undercover: "Jacke" },
  { civilian: "Gürtel", undercover: "Krawatte" },
  { civilian: "Geldbörse", undercover: "Portemonnaie" },
  { civilian: "Rucksack", undercover: "Tasche" },
  { civilian: "Schlüssel", undercover: "Schloss" },
  { civilian: "Hammer", undercover: "Zange" },
  { civilian: "Nagel", undercover: "Schraube" },
  { civilian: "Pinsel", undercover: "Stift" },
  { civilian: "Farbe", undercover: "Lack" },
  { civilian: "Papier", undercover: "Pappe" },
  { civilian: "Kleber", undercover: "Tape" },
  { civilian: "Faden", undercover: "Seil" },
  { civilian: "Nadel", undercover: "Streichholz" },
  { civilian: "Korb", undercover: "Eimer" },
  { civilian: "Flasche", undercover: "Krug" },
  { civilian: "Glas", undercover: "Tasse" },
  { civilian: "Spiegel", undercover: "Fenster" },
  { civilian: "Decke", undercover: "Kissen" },
  { civilian: "Bett", undercover: "Sofa" },
  { civilian: "Regal", undercover: "Schrank" },
  { civilian: "Pflaster", undercover: "Bandage" },
  { civilian: "Fieber", undercover: "Erkältung" },
  { civilian: "Arzt", undercover: "Krankenschwester" },
  { civilian: "Polizei", undercover: "Feuerwehr" },
  { civilian: "Lehrer", undercover: "Schüler" },
  { civilian: "Bäcker", undercover: "Koch" },
  { civilian: "Pilot", undercover: "Fahrer" },
  { civilian: "Gärtner", undercover: "Landwirt" },
  { civilian: "Sänger", undercover: "Musiker" },
  { civilian: "Autor", undercover: "Dichter" },
  { civilian: "Maler", undercover: "Bildhauer" },
  { civilian: "Tänzer", undercover: "Turner" },
  { civilian: "Schwimmer", undercover: "Läufer" },
  { civilian: "Schach", undercover: "Dame" },
  { civilian: "Karten", undercover: "Würfel" },
  { civilian: "Ball", undercover: "Reifen" },
  { civilian: "Gitarre", undercover: "Klavier" },
  { civilian: "Geige", undercover: "Cello" },
  { civilian: "Trommel", undercover: "Becken" },
  { civilian: "Pfeife", undercover: "Flöte" },
  { civilian: "Zelt", undercover: "Hütte" },
  { civilian: "Lagerfeuer", undercover: "Grill" },
  { civilian: "Wald", undercover: "Busch" },
  { civilian: "Wiese", undercover: "Feld" },
  { civilian: "Sand", undercover: "Kies" },
  { civilian: "Stein", undercover: "Fels" },
  { civilian: "Wolke", undercover: "Nebel" },
  { civilian: "Wind", undercover: "Sturm" },
  { civilian: "Blitz", undercover: "Donner" },
  { civilian: "Schwein", undercover: "Kuh" },
  { civilian: "Ziege", undercover: "Schaf" },
  { civilian: "Ente", undercover: "Gans" },
  { civilian: "Huhn", undercover: "Hahn" },
  { civilian: "Esel", undercover: "Pferd" },
  { civilian: "Maus", undercover: "Ratte" },
  { civilian: "Fuchs", undercover: "Wolf" },
  { civilian: "Bär", undercover: "Löwe" },
  { civilian: "Tiger", undercover: "Leopard" },
  { civilian: "Elefant", undercover: "Nashorn" },
  { civilian: "Affe", undercover: "Gorilla" },
  { civilian: "Schlange", undercover: "Eidechse" },
  { civilian: "Krokodil", undercover: "Alligator" },
  { civilian: "Schildkröte", undercover: "Frosch" },
  { civilian: "Spinne", undercover: "Insekt" },
  { civilian: "Biene", undercover: "Wespe" },
  { civilian: "Schmetterling", undercover: "Motte" },
  { civilian: "Ameise", undercover: "Marienkäfer" },
  { civilian: "Wurm", undercover: "Made" },
  { civilian: "Fliege", undercover: "Mücke" },
  { civilian: "Eule", undercover: "Falke" },
  { civilian: "Spatz", undercover: "Meise" },
  { civilian: "Falke", undercover: "Adler" },
];

// ---------------------------------------------------------------
// Discord Client Initialization
// ---------------------------------------------------------------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  // Partials allow the bot to receive events for uncached messages/users/etc.
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
  ],
});

// In‑memory game registry per guild (one active game per server)
const activeGames = {};

// ---------------------------------------------------------------
// Lifecycle & Presence
// ---------------------------------------------------------------
client.once("ready", () => {
  console.log(`Eingeloggt als ${client.user.tag}!`);
  // Activity type 0 = PLAYING (discord.js v14 numeric activity types)
  client.user.setActivity("Undercover spielen", { type: 0 });
});

// ---------------------------------------------------------------
// Message Handler (DM: Mr. White guessing, Guild: legacy !endgame)
// ---------------------------------------------------------------
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore other bots

  // DM flow: handle Mr. White's final guess via !guess
  if (message.channel.isDMBased && message.channel.isDMBased()) {
    const args = message.content.trim().split(/ +/);
    const command = (args.shift() || "").toLowerCase();

    if (command === "!guess" || command === "guess") {
      const userId = message.author.id;

      // Find the guild where this user is the current Mr. White guesser
      const gameId = Object.keys(activeGames).find((guildId) => {
        const game = activeGames[guildId];
        return (
          game &&
          game.status === "mr_white_guess" &&
          game.currentVotingTarget &&
          game.currentVotingTarget.id === userId
        );
      });

      if (!gameId) {
        return message.author.send(
          "Du bist momentan nicht an der Reihe, das Wort zu erraten, oder kein Spiel ist in dieser Phase."
        );
      }

      const game = activeGames[gameId];
      const guess = args.join(" ").trim().toLowerCase();
      if (!guess) {
        return message.author.send(
          "Bitte gib ein Wort an, das du erraten möchtest, z.B. `!guess Apfel`."
        );
      }

      // Validate Mr. White's guess against the civilians' word
      if (guess === game.words.civilian.toLowerCase()) {
        await message.author.send(
          "**✅ KORREKT! Mr. White hat gewonnen!** Herzlichen Glückwunsch!"
        );
        game.status = "finished";
        const guild = await client.guilds.fetch(gameId);
        const channel = guild.channels.cache.get(game.channelId);
        if (channel) {
          await channel.send(
            `🎉 **Mr. White (<@${userId}>) hat das Zivilisten-Wort richtig erraten und gewinnt!**\nDas Wort der Zivilisten war: **${game.words.civilian}**\nDas Wort des Undercovers war: **${game.words.undercover}**`
          );
        }
        delete activeGames[gameId];
      } else {
        await message.author.send(
          "❌ Leider falsch! Mr. White konnte das Wort nicht erraten."
        );
        game.status = "finished";
        const guild = await client.guilds.fetch(gameId);
        const channel = guild.channels.cache.get(game.channelId);
        if (channel) {
          await channel.send(
            `😔 **Mr. White (<@${userId}>) konnte das Zivilisten-Wort nicht erraten.** Das Spiel geht für die anderen Rollen weiter.`
          );
        }
      }
    }
  } else if (message.content.startsWith("!endgame")) {
    // Optional legacy text command to end the game (host only)
    if (!message.guild) return;
    const guildId = message.guild.id;
    const game = activeGames[guildId];
    if (!game) {
      return message.channel.send(
        "Es läuft gerade kein Spiel, das du beenden könntest."
      );
    }
    if (game.hostId !== message.author.id) {
      return message.channel.send("Nur der Host kann das Spiel beenden.");
    }
    delete activeGames[guildId];
    await message.channel.send("Das Undercover-Spiel wurde beendet.");
  }
});

// ---------------------------------------------------------------
// Reaction Join/Leave Flow (✅ reaction while lobby is open)
// ---------------------------------------------------------------
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (!reaction.message.guild) return;
  const guildId = reaction.message.guild.id;
  const game = activeGames[guildId];

  if (
    game &&
    game.status === "waiting_for_players" &&
    reaction.message.id === game.lastMessageId &&
    reaction.emoji.name === "✅"
  ) {
    // Prevent duplicate joins by removing the reaction
    if (game.players.some((p) => p.id === user.id)) {
      try {
        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        await reaction.users.remove(member.user.id);
      } catch (error) {
        console.error("Fehler beim Entfernen der doppelten Reaktion:", error);
      }
      return;
    }

    // Add new player to the lobby
    game.players.push({
      id: user.id,
      username: user.username,
      role: null,
      word: null,
      isAlive: true,
      hasGivenHint: false,
    });
    await reaction.message.channel.send(
      `${user.username} ist dem Spiel beigetreten! (${game.players.length} Spieler)`
    );
    updateJoinMessage(game, reaction.message.channel);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (!reaction.message.guild) return;
  const guildId = reaction.message.guild.id;
  const game = activeGames[guildId];

  if (
    game &&
    game.status === "waiting_for_players" &&
    reaction.message.id === game.lastMessageId &&
    reaction.emoji.name === "✅"
  ) {
    // Remove player from the lobby when they unreact
    const playerIndex = game.players.findIndex((p) => p.id === user.id);
    if (playerIndex !== -1) {
      game.players.splice(playerIndex, 1);
      await reaction.message.channel.send(
        `${user.username} hat das Spiel verlassen. (${game.players.length} Spieler)`
      );
      updateJoinMessage(game, reaction.message.channel);
    }
  }
});

// ---------------------------------------------------------------
// Slash Command & Button Interaction Handling
// ---------------------------------------------------------------
client.on("interactionCreate", async (interaction) => {
  // Slash commands (chat input)
  if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
    const { commandName, options } = interaction;
    const guildId = interaction.guild.id;
    const channel = interaction.channel;
    const user = interaction.user;

    switch (commandName) {
      case "start":
        await handleStartCommand(
          interaction,
          user,
          channel,
          guildId,
          options.getString("game")
        );
        break;
      case "join":
        await handleJoinCommand(interaction, user, channel, guildId);
        break;
      case "play":
        await handlePlayCommand(interaction, user, channel, guildId);
        break;
      case "vote":
        await handleVoteCommand(interaction, user, channel, guildId);
        break;
      case "endvote":
        await handleEndVoteCommand(interaction, user, channel, guildId);
        break;
      case "endgame":
        await handleEndGameCommand(interaction, user, channel, guildId);
        break;
      default:
        await interaction.reply({
          content: "Unbekannter Befehl!",
          ephemeral: true,
        });
        break;
    }
  }
  // Voting buttons
  else if (interaction.isButton && interaction.isButton()) {
    const guildId = interaction.guild.id;
    const game = activeGames[guildId];

    // Validate button belongs to the current vote
    if (
      !game ||
      game.status !== "playing_vote" ||
      interaction.message.id !== game.votingMessageId
    ) {
      return interaction.reply({
        content:
          "Diese Abstimmung ist nicht mehr aktiv oder gehört nicht zum aktuellen Spiel.",
        ephemeral: true,
      });
    }

    const voterId = interaction.user.id;
    const votedForId = interaction.customId.replace("vote_", "");

    // Only alive players can vote
    const voterPlayer = game.players.find((p) => p.id === voterId && p.isAlive);
    if (!voterPlayer) {
      return interaction.reply({
        content:
          "Du bist nicht Teil dieses Spiels oder bist bereits eliminiert.",
        ephemeral: true,
      });
    }

    // Disallow self‑votes
    if (voterId === votedForId) {
      return interaction.reply({
        content: "Du kannst nicht für dich selbst abstimmen.",
        ephemeral: true,
      });
    }

    const targetPlayer = game.players.find(
      (p) => p.id === votedForId && p.isAlive
    );
    if (!targetPlayer) {
      return interaction.reply({
        content:
          "Der Spieler, für den du abstimmen möchtest, ist nicht (mehr) im Spiel.",
        ephemeral: true,
      });
    }

    // Record the vote (last vote per user wins)
    game.votes[voterId] = votedForId;
    await interaction.reply({
      content: `Deine Stimme für ${targetPlayer.username} wurde registriert.`,
      ephemeral: true,
    });

    // If all alive players have voted, automatically close the vote
    const alivePlayers = game.players.filter((p) => p.isAlive);
    const uniqueVoters = new Set(Object.keys(game.votes));
    if (uniqueVoters.size >= alivePlayers.length) {
      await endVotingPhase(game, interaction.channel);
    }
  }
});

// ---------------------------------------------------------------
// Command Implementations
// ---------------------------------------------------------------
/**
 * Starts a new game lobby for the given guild.
 * - Creates lobby state and a join message with a ✅ reaction.
 */
async function handleStartCommand(
  interaction,
  user,
  channel,
  guildId,
  gameType
) {
  if (gameType && gameType.toLowerCase() === "undercover") {
    // Only one active game per guild
    if (activeGames[guildId] && activeGames[guildId].status !== "finished") {
      return interaction.reply({
        content:
          "Es läuft bereits eine Runde Undercover auf diesem Server. Bitte beende das aktuelle Spiel mit `/endgame` oder warte, bis es vorbei ist.",
        ephemeral: true,
      });
    }

    // Initialize game state
    activeGames[guildId] = {
      guildId,
      status: "waiting_for_players",
      players: [],
      hostId: user.id,
      words: {},
      currentTurnPlayerIndex: 0,
      votes: {},
      lastMessageId: null,
      votingMessageId: null,
      eliminatedPlayers: [],
      currentVotingTarget: null,
      channelId: channel.id,
    };

    // Lobby embed
    const embed = {
      color: 0x0099ff,
      title: "🎲 Undercover: Neues Spiel gestartet! 🎲",
      description:
        "Eine neue Runde Undercover wartet auf Spieler! Klicke auf den **✅-Reaktions-Button unten** oder nutze `/join`, um beizutreten.",
      fields: [
        {
          name: "Aktuelle Spieler",
          value: "Noch keine Spieler beigetreten.",
          inline: false,
        },
        {
          name: "So geht's",
          value: `Wenn genügend Spieler beigetreten sind (mind. ${MIN_PLAYERS}), kann der Host (<@${user.id}>) das Spiel mit \`/play\` starten.`,
          inline: false,
        },
      ],
      footer: { text: "Der Bot sendet dir dein Wort per Direktnachricht!" },
    };

    await interaction.deferReply();
    const joinMessage = await channel.send({ embeds: [embed] });
    await joinMessage.react("✅");

    activeGames[guildId].lastMessageId = joinMessage.id;
    await interaction.followUp(
      `Der Host <@${user.id}> hat das Spiel gestartet.`
    );
  } else {
    await interaction.reply({
      content:
        "Bitte gib an, welches Spiel du starten möchtest. (z.B. `/start undercover`)",
      ephemeral: true,
    });
  }
}

/**
 * Adds the interacting user to the current lobby.
 */
async function handleJoinCommand(interaction, user, channel, guildId) {
  const game = activeGames[guildId];
  if (!game || game.status !== "waiting_for_players") {
    return interaction.reply({
      content:
        "Es läuft gerade kein Spiel, dem du beitreten kannst. Starte ein neues mit `/start undercover`.",
      ephemeral: true,
    });
  }

  // Prevent duplicate joins
  if (game.players.some((p) => p.id === user.id)) {
    return interaction.reply({
      content: `${user.username}, du bist bereits im Spiel!`,
      ephemeral: true,
    });
  }

  // Add player to lobby
  game.players.push({
    id: user.id,
    username: user.username,
    role: null,
    word: null,
    isAlive: true,
    hasGivenHint: false,
  });

  await interaction.reply({
    content: `${user.username} ist dem Spiel beigetreten! (${game.players.length} Spieler)`,
    ephemeral: false,
  });
  updateJoinMessage(game, channel);
}

/**
 * Distributes roles/words via DM and starts the first hint round.
 * - Role composition scales with player count.
 */
async function handlePlayCommand(interaction, user, channel, guildId) {
  const game = activeGames[guildId];
  if (!game || game.hostId !== user.id) {
    return interaction.reply({
      content:
        "Du bist nicht der Host dieses Spiels oder es läuft kein Spiel, das du starten könntest.",
      ephemeral: true,
    });
  }

  if (game.players.length < MIN_PLAYERS) {
    return interaction.reply({
      content: `Es werden mindestens ${MIN_PLAYERS} Spieler benötigt, um das Spiel zu starten. Aktuell: ${game.players.length}`,
      ephemeral: true,
    });
  }

  // Pick a random word pair for this round
  const randomIndex = Math.floor(Math.random() * DEFAULT_WORDS.length);
  game.words = DEFAULT_WORDS[randomIndex];

  // Determine role counts
  const numPlayers = game.players.length;
  let numUndercovers = 1;
  let numMrWhite = 0;
  if (numPlayers >= 7) numUndercovers = 2;
  if (numPlayers >= 5) numMrWhite = 1;

  // Assign roles randomly (civilian by default)
  const roles = Array(numPlayers).fill("civilian");

  for (let i = 0; i < numMrWhite; i++) {
    let assigned = false;
    while (!assigned) {
      const idx = Math.floor(Math.random() * numPlayers);
      if (roles[idx] === "civilian") {
        roles[idx] = "mr_white";
        assigned = true;
      }
    }
  }

  for (let i = 0; i < numUndercovers; i++) {
    let assigned = false;
    while (!assigned) {
      const idx = Math.floor(Math.random() * numPlayers);
      if (roles[idx] === "civilian") {
        roles[idx] = "undercover";
        assigned = true;
      }
    }
  }

  await interaction.deferReply();

  // DM each player their word (or lack thereof for Mr. White)
  for (let i = 0; i < numPlayers; i++) {
    const player = game.players[i];
    player.role = roles[i];

    let wordToSend;
    if (player.role === "civilian") {
      player.word = game.words.civilian;
      wordToSend = game.words.civilian;
    } else if (player.role === "undercover") {
      player.word = game.words.undercover;
      wordToSend = game.words.undercover;
    } else {
      player.word = null;
      wordToSend = "Nichts (du bist Mr. White)";
    }

    try {
      const userDM = await client.users.fetch(player.id);
      await userDM.send(`Dein Wort: **${wordToSend}**`);
    } catch (error) {
      console.error(
        `Konnte DM an ${player.username} (${player.id}) nicht senden:`,
        error
      );
      await channel.send(
        `**Achtung, <@${
          player.id
        }>!** Ich konnte dir keine Direktnachricht senden.\nWahrscheinlich sind deine DMs für diesen Server blockiert.\n${getDMHelpMessage()}`
      );
    }
  }

  // Start the first hint round with a random alive player
  game.status = "playing_hints";
  game.currentTurnPlayerIndex = Math.floor(Math.random() * numPlayers);
  const currentPlayer = game.players[game.currentTurnPlayerIndex];

  await interaction.followUp({
    embeds: [
      {
        color: 0xffa500,
        title: "🎉 Undercover: Das Spiel beginnt! 🎉",
        description:
          "Die Rollen und Wörter wurden per Direktnachricht verteilt! Schaut in euren DMs nach.",
        fields: [
          {
            name: "Aktuelle Spieler",
            value: game.players.map((p) => `- <@${p.id}>`).join("\n"),
            inline: false,
          },
          { name: "Runde", value: "Hinweis-Phase", inline: false },
          {
            name: "An der Reihe",
            value: `<@${currentPlayer.id}>`,
            inline: false,
          },
          {
            name: "Aufgabe",
            value:
              "Gib einen Hinweis zu deinem Wort, ohne es zu direkt zu verraten!",
            inline: false,
          },
        ],
        footer: {
          text: `Der Host ist <@${game.hostId}>. Benutzt Slash-Kommandos für Hinweise und Abstimmungen.`,
        },
      },
    ],
  });
}

/**
 * Opens a voting phase with buttons for all alive players.
 */
async function handleVoteCommand(interaction, user, channel, guildId) {
  const game = activeGames[guildId];
  if (!game || game.hostId !== user.id) {
    return interaction.reply({
      content:
        "Du bist nicht der Host dieses Spiels oder es läuft kein Spiel, das du beeinflussen könntest.",
      ephemeral: true,
    });
  }

  if (game.status !== "playing_hints" && game.status !== "playing_vote") {
    return interaction.reply({
      content:
        "Die Abstimmung kann nur während der Hinweis-Phase oder wenn bereits abgestimmt wird, gestartet werden.",
      ephemeral: true,
    });
  }

  game.status = "playing_vote";
  game.votes = {};

  const alivePlayers = game.players.filter((p) => p.isAlive);
  if (alivePlayers.length === 0) {
    return interaction.reply({
      content: "Keine Spieler mehr übrig zum Abstimmen!",
      ephemeral: true,
    });
  }

  // Build button rows (max 5 buttons per row)
  const buttons = alivePlayers.map((player) =>
    new ButtonBuilder()
      .setCustomId(`vote_${player.id}`)
      .setLabel(`Vote ${player.username}`)
      .setStyle(ButtonStyle.Primary)
  );

  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
  }

  const voteEmbed = {
    color: 0x0099ff,
    title: "🗳️ Zeit für die Abstimmung! 🗳️",
    description:
      "Klickt auf den Button der Person, die ihr für Undercover oder Mr. White haltet!",
    fields: [
      {
        name: "Verbleibende Spieler",
        value: alivePlayers.map((p) => `- <@${p.id}>`).join("\n") || "Keine.",
        inline: false,
      },
      {
        name: "Anleitung",
        value:
          "Jeder lebende Spieler kann einmal abstimmen. Wer die meisten Stimmen erhält, wird eliminiert.",
        inline: false,
      },
    ],
    footer: {
      text: `Der Host (<@${game.hostId}>) kann die Abstimmung mit '/endvote' beenden.`,
    },
  };

  await interaction.deferReply();
  const voteMessage = await channel.send({
    embeds: [voteEmbed],
    components: rows,
  });
  game.votingMessageId = voteMessage.id;
  await interaction.followUp("Die Abstimmung hat begonnen!");
}

/**
 * Allows the host to close the vote early and process results.
 */
async function handleEndVoteCommand(interaction, user, channel, guildId) {
  const game = activeGames[guildId];
  if (!game || game.hostId !== user.id) {
    return interaction.reply({
      content: "Du bist nicht der Host dieses Spiels.",
      ephemeral: true,
    });
  }
  if (game.status !== "playing_vote") {
    return interaction.reply({
      content: "Es läuft gerade keine Abstimmung, die du beenden könntest.",
      ephemeral: true,
    });
  }
  await interaction.deferReply();
  await endVotingPhase(game, channel);
  await interaction.deleteReply();
}

/**
 * Ends the current game. Host only.
 */
async function handleEndGameCommand(interaction, user, channel, guildId) {
  const game = activeGames[guildId];
  if (!game) {
    return interaction.reply({
      content: "Es läuft gerade kein Spiel, das du beenden könntest.",
      ephemeral: true,
    });
  }
  if (game.hostId !== user.id) {
    return interaction.reply({
      content: "Nur der Host kann das Spiel beenden.",
      ephemeral: true,
    });
  }
  delete activeGames[guildId];
  await interaction.reply("Das Undercover-Spiel wurde beendet.");
}

// ---------------------------------------------------------------
// Lobby UI Update Helper
// ---------------------------------------------------------------
async function updateJoinMessage(game, channel) {
  if (!game.lastMessageId) return;
  try {
    const joinMessage = await channel.messages.fetch(game.lastMessageId);
    const playerList =
      game.players.length > 0
        ? game.players.map((p) => `- ${p.username}`).join("\n")
        : "Noch keine Spieler beigetreten.";
    const updatedEmbed = {
      color: 0x0099ff,
      title: "🎲 Undercover: Neues Spiel gestartet! 🎲",
      description:
        "Eine neue Runde Undercover wartet auf Spieler! Klicke auf den **✅-Reaktions-Button unten** oder nutze `/join`, um beizutreten.",
      fields: [
        { name: "Aktuelle Spieler", value: playerList, inline: false },
        {
          name: "So geht's",
          value: `Wenn genügend Spieler beigetreten sind (mind. ${MIN_PLAYERS}), kann der Host (<@${game.hostId}>) das Spiel mit \`/play\` starten.`,
          inline: false,
        },
      ],
      footer: { text: "Der Bot sendet dir dein Wort per Direktnachricht!" },
    };
    await joinMessage.edit({ embeds: [updatedEmbed] });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Join-Nachricht:", error);
    game.lastMessageId = null; // prevent repeated failing fetches
  }
}

/**
 * Returns a localized help string explaining how to enable DMs from server members.
 */
function getDMHelpMessage() {
  return `**💡 So aktivierst du Direktnachrichten (DMs) für Bots auf diesem Server:**

1. Klicke auf den **Servernamen** oben links in Discord.
2. Wähle **"Datenschutz-Einstellungen"**.
3. Aktiviere **"Direktnachrichten von Servermitgliedern zulassen"**.
4. Änderungen speichern und erneut versuchen.`;
}

// ---------------------------------------------------------------
// Voting Resolution & Win Condition Logic
// ---------------------------------------------------------------
/**
 * Resolves the current voting phase. Handles ties, elimination,
 * Mr. White guessing window, and advances to the next hint round.
 */
async function endVotingPhase(game, channel) {
  if (game.status !== "playing_vote" && game.status !== "mr_white_guess")
    return;
  game.status = "processing_vote";

  // Remove components so users cannot vote again
  if (game.votingMessageId) {
    try {
      const voteMessage = await channel.messages.fetch(game.votingMessageId);
      await voteMessage.edit({ components: [] });
    } catch (error) {
      console.error(
        "Konnte Abstimmungsnachricht nicht aktualisieren/Buttons entfernen:",
        error
      );
    }
  }

  // Count votes (last vote per voter counts)
  const voteCounts = {};
  for (const voterId in game.votes) {
    const votedForId = game.votes[voterId];
    voteCounts[votedForId] = (voteCounts[votedForId] || 0) + 1;
  }

  let eliminatedPlayerId = null;
  let maxVotes = -1;
  let tiedPlayers = [];

  // Determine top‑voted player; handle ties
  for (const playerId in voteCounts) {
    if (voteCounts[playerId] > maxVotes) {
      maxVotes = voteCounts[playerId];
      eliminatedPlayerId = playerId;
      tiedPlayers = [playerId];
    } else if (voteCounts[playerId] === maxVotes) {
      tiedPlayers.push(playerId);
    }
  }

  if (eliminatedPlayerId === null || tiedPlayers.length > 1) {
    await channel.send(
      "Die Abstimmung endete unentschieden oder es wurden keine gültigen Stimmen abgegeben. Niemand wurde eliminiert."
    );
    game.status = "playing_hints";
    game.votes = {};

    // Advance to the next alive player
    const currentAlivePlayers = game.players.filter((p) => p.isAlive);
    if (currentAlivePlayers.length > 0) {
      let nextTurnIndex = game.currentTurnPlayerIndex;
      let count = 0;
      do {
        nextTurnIndex = (nextTurnIndex + 1) % game.players.length;
        count++;
        if (count > game.players.length * 2 && game.players.length > 0) break;
      } while (!game.players[nextTurnIndex].isAlive && game.players.length > 0);

      game.currentTurnPlayerIndex = nextTurnIndex;
      const nextPlayer = game.players[game.currentTurnPlayerIndex];
      return channel.send(
        `Die Hinweis-Phase geht weiter! <@${nextPlayer.id}> ist an der Reihe.`
      );
    } else {
      return channel.send(
        `Es gibt keine lebenden Spieler mehr. Das Spiel endet hier.`
      );
    }
  }

  // Apply elimination
  const eliminatedPlayer = game.players.find(
    (p) => p.id === eliminatedPlayerId
  );
  if (eliminatedPlayer) {
    eliminatedPlayer.isAlive = false;
    game.eliminatedPlayers.push(eliminatedPlayer.id);

    await channel.send(`**<@${eliminatedPlayer.id}> wurde eliminiert!**`);

    // If Mr. White is eliminated, open a 30‑second DM guess window
    if (eliminatedPlayer.role === "mr_white") {
      game.currentVotingTarget = eliminatedPlayer;
      game.status = "mr_white_guess";
      await channel.send(
        `Oh, das war **Mr. White**! <@${eliminatedPlayer.id}>, du hast jetzt die Chance zu gewinnen!\nDu musst das Wort der **Zivilisten** erraten. Sende mir dein Wort per **Direktnachricht** mit \`!guess <dein Wort>\`. Du hast 30 Sekunden Zeit.`
      );
      setTimeout(async () => {
        const g = activeGames[game.guildId];
        if (
          g &&
          g.status === "mr_white_guess" &&
          g.currentVotingTarget &&
          g.currentVotingTarget.id === eliminatedPlayer.id
        ) {
          await channel.send(
            `⏱️ **Mr. White (<@${eliminatedPlayer.id}>) hat nicht rechtzeitig geraten.**`
          );
          await channel.send(
            `😔 **Mr. White (<@${eliminatedPlayer.id}>) konnte das Zivilisten-Wort nicht erraten.** Das Spiel geht für die anderen Rollen weiter.`
          );
          await checkWinCondition(game, channel);
        }
      }, 30 * 1000);
    } else {
      await checkWinCondition(game, channel);
    }
  }
}

/**
 * Evaluates whether a win condition is met and announces the result,
 * otherwise advances the game to the next hint round.
 */
async function checkWinCondition(game, channel) {
  const alivePlayers = game.players.filter((p) => p.isAlive);
  const aliveCivilians = alivePlayers.filter((p) => p.role === "civilian");
  const aliveUndercovers = alivePlayers.filter((p) => p.role === "undercover");
  const aliveMrWhite = alivePlayers.filter((p) => p.role === "mr_white");

  let gameEnded = false;
  let winnerMessage = "";
  let descriptionMessage = "";

  // Civilians win if all threats are gone
  if (aliveUndercovers.length === 0 && aliveMrWhite.length === 0) {
    gameEnded = true;
    winnerMessage = "🎉 **DIE ZIVILISTEN HABEN GEWONNEN!** 🎉";
    descriptionMessage = `Alle Undercover und Mr. White wurden eliminiert. Die Zivilisten haben die Wahrheit ans Licht gebracht!\nDas Wort der Zivilisten war: **${game.words.civilian}**\nDas Wort des Undercovers war: **${game.words.undercover}**`;
  }
  // Undercover/Mr. White win if they are not outnumbered by civilians
  else if (
    aliveUndercovers.length + aliveMrWhite.length >= aliveCivilians.length &&
    aliveCivilians.length > 0
  ) {
    gameEnded = true;
    winnerMessage = "😈 **DIE UNDERCOVER HABEN GEWONNEN!** 😈";
    descriptionMessage = `Die Undercover und Mr. White haben die Zivilisten in der Anzahl übertroffen!\nDas Wort der Zivilisten war: **${game.words.civilian}**\nDas Wort des Undercovers war: **${game.words.undercover}**`;
  }
  // Edge case: only threats remain
  else if (
    alivePlayers.length <= 1 &&
    (aliveUndercovers.length > 0 || aliveMrWhite.length > 0)
  ) {
    gameEnded = true;
    winnerMessage = "😈 **DIE UNDERCOVER HABEN GEWONNEN!** 😈";
    descriptionMessage = `Es ist kein Zivilist mehr übrig oder nur noch ein Undercover/Mr. White ist am Leben!\nDas Wort der Zivilisten war: **${game.words.civilian}**\nDas Wort des Undercovers war: **${game.words.undercover}**`;
  }

  if (gameEnded) {
    await channel.send({
      embeds: [
        {
          color: 0x00ff00,
          title: winnerMessage,
          description: descriptionMessage,
          fields: [
            {
              name: "Rollenverteilung am Ende",
              value:
                game.players
                  .map(
                    (p) =>
                      `- <@${p.id}> (${
                        p.role.charAt(0).toUpperCase() + p.role.slice(1)
                      }) ${p.isAlive ? "✅ Lebend" : "❌ Eliminiert"}`
                  )
                  .join("\n") || "Keine Spieler.",
              inline: false,
            },
          ],
          footer: { text: "Das Spiel ist beendet." },
        },
      ],
    });
    delete activeGames[game.guildId];
  } else {
    // Reset to hint phase and rotate to next alive player
    game.status = "playing_hints";
    game.votes = {};

    const currentAlivePlayers = game.players.filter((p) => p.isAlive);
    if (currentAlivePlayers.length > 0) {
      let nextTurnIndex = game.currentTurnPlayerIndex;
      let count = 0;
      do {
        nextTurnIndex = (nextTurnIndex + 1) % game.players.length;
        count++;
        if (count > game.players.length * 2 && game.players.length > 0) break;
      } while (!game.players[nextTurnIndex].isAlive && game.players.length > 0);

      game.currentTurnPlayerIndex = nextTurnIndex;
      const nextPlayer = game.players[game.currentTurnPlayerIndex];

      await channel.send({
        embeds: [
          {
            color: 0xffa500,
            title: "🗣️ Nächste Hinweis-Runde! 🗣️",
            description: "Das Spiel geht weiter.",
            fields: [
              {
                name: "Verbleibende Spieler",
                value:
                  alivePlayers.map((p) => `- <@${p.id}>`).join("\n") ||
                  "Keine.",
                inline: false,
              },
              {
                name: "An der Reihe",
                value: `<@${nextPlayer.id}>`,
                inline: false,
              },
              {
                name: "Aufgabe",
                value: "Gib einen weiteren Hinweis zu deinem Wort!",
                inline: false,
              },
            ],
            footer: {
              text: `Der Host ist <@${game.hostId}>. Benutzt Slash-Kommandos für Hinweise und Abstimmungen.`,
            },
          },
        ],
      });
    } else {
      await channel.send("Es sind keine Spieler mehr übrig. Das Spiel endet.");
      delete activeGames[game.guildId];
    }
  }
}

// ---------------------------------------------------------------
// Log in
// ---------------------------------------------------------------
client.login(token);
