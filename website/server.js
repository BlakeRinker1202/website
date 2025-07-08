const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

const linkedUsersFile = path.join(__dirname, '..', 'linkedUsers.json');
let linkedUsers = {};
if (fs.existsSync(linkedUsersFile)) {
  linkedUsers = JSON.parse(fs.readFileSync(linkedUsersFile, 'utf-8'));
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Verification form
app.get('/verify', (req, res) => {
  const discordId = req.query.discordId;
  if (!discordId) return res.send('Missing Discord ID!');
  res.render('verify', { discordId });
});

// Verification submission
app.post('/verify', async (req, res) => {
  const { discordId, roblosecurity } = req.body;
  if (!discordId || !roblosecurity) {
    return res.send('Missing Discord ID or Roblox cookie!');
  }

  try {
    // Fetch Roblox user using .ROBLOSECURITY
    const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
      headers: {
        Cookie: `.ROBLOSECURITY=${roblosecurity}`
      }
    });

    if (!response.ok) {
      return res.send('❌ Invalid Roblox cookie. Please try again.');
    }

    const data = await response.json();
    const robloxId = data.id;
    const robloxUsername = data.name;

    // Save the link
    linkedUsers[discordId] = robloxId;
    fs.writeFileSync(linkedUsersFile, JSON.stringify(linkedUsers, null, 2));

    res.send(`
      <h2>✅ Verification successful!</h2>
      <p>Discord ID: ${discordId}</p>
      <p>Roblox ID: ${robloxId}</p>
      <p>Username: ${robloxUsername}</p>
      <p>You can close this page now.</p>
    `);
  } catch (err) {
    console.error(err);
    res.send('❌ An error occurred. Please try again.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Verification site running at http://localhost:${PORT}`);
});
