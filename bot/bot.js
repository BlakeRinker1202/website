const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ['CHANNEL']
});

const TOKEN = 'MTM5MjE1Njk4MjQwNzg2MDM5NQ.GI9iev.5y9Uks-lfPt-es9YTCUARd77ui2AtgA9rpSgJM';
const linkedUsersFile = path.join(__dirname, '..', 'linkedUsers.json');

let linkedUsers = {};
if (fs.existsSync(linkedUsersFile)) {
  linkedUsers = JSON.parse(fs.readFileSync(linkedUsersFile, 'utf-8'));
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '/link') {
    const discordId = message.author.id;
    const verifyUrl = `http://localhost:3000/verify?discordId=${discordId}`;
    try {
      await message.author.send(`🛡️ Click here to verify your Roblox account:\n${verifyUrl}`);
      await message.reply('✅ I sent you a DM with the verification link!');
    } catch (err) {
      console.error(err);
      await message.reply('❌ I couldn’t DM you. Please check your privacy settings.');
    }
  }

  if (message.content === '/check') {
    const discordId = message.author.id;
    const robloxId = linkedUsers[discordId];
    if (robloxId) {
      await message.reply(`✅ You are verified! Roblox ID: ${robloxId}`);
    } else {
      await message.reply('❌ You are not verified yet. Use /link to start.');
    }
  }
});

client.login(TOKEN);
