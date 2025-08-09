# Undercover – Discord Party Game (German)

A Discord bot for playing the German-language party game **Undercover** on Discord. Players receive secret words via DM, give hints in turns, and vote to eliminate suspects. Includes **slash commands**, **button-based voting**, and **Mr. White** guessing via DM.

> **Stack**: Node.js ≥ 18, discord.js v14, Express (keep-alive), CommonJS

---

## ✅ TL;DR (Quickstart)

```bash
# 1) Clone and enter the project
git clone https://github.com/YOUR_GITHUB_USERNAME/undercover-discord-bot.git
cd undercover-discord-bot

# 2) Install dependencies
npm install

# 3) Prepare config and fill in your credentials
cp config.example.json config.json

# 4) Register slash-commands to a test guild (fast, local scope)
npm run deploy-commands

# 5) Start the bot
npm start
```

> ⚠️ Edit `config.json` before step 4/5 and insert your `token`, `clientId`, and a test `guildId`.

---

## Commands (Slash)

- `/start game:undercover` – Creates a lobby (✅ reaction or `/join` to join)
- `/join` – Join the current lobby
- `/play` – Host starts the game and distributes words via DM
- `/vote` – Host opens voting with buttons
- `/endvote` – Host closes voting and processes elimination
- `/endgame` – Host ends the game

**Mr. White Guessing (DM):** After elimination, Mr. White has **30 seconds** to DM `!guess <word>`.

---

## Configuration

1. Copy example config and fill in values:
   ```bash
   cp config.example.json config.json
   ```

2. Open `config.json` and set:
   - `token`: Your bot token
   - `clientId`: Your application client ID
   - `guildId`: A test guild ID to register commands during development

> Never commit real tokens. Keep `config.json` untracked (see `.gitignore`).

---

## Install (fresh repo)

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/undercover-discord-bot.git
cd undercover-discord-bot
npm install
cp config.example.json config.json
```

### Register slash commands (guild scoped)

```bash
npm run deploy-commands
```

### Run the bot

```bash
npm start
```

The bot exposes a tiny HTTP server on `PORT` (default `3000`) so platforms like Replit consider the process “alive”.

---

## Hosting Notes

- **Node 18+** required.
- For Replit or similar, the included Express server responds on `/`.
- For production, consider a process manager (PM2, systemd) and storing secrets via environment variables instead of `config.json`.

---

## Security

- Never commit `config.json` with real tokens.
- Use the provided `.gitignore` (keeps `config.json` and `node_modules/` out of Git).
- Rotate your token if it leaks.

---



## License
```bash
MIT License

Copyright (c) 2025 Abbas El Mahmoud

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Author
Developed by [AbbasEl11](https://https://github.com/AbbasEl11)
