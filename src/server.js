const express = require('express');
const session = require('express-session');
const { accessGoogleSheet, oauth2Client, scopes } = require('./sheets');
require('dotenv').config();

const app = express();
const PORT = 3005;

app.use(express.static('public'));
app.use(express.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    res.send('Authentication successful! You can close this window.');
});

app.get('/create-design', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth');
    }

    try {
        const sheetData = await accessGoogleSheet(req.session.tokens);
        res.json(sheetData);
    } catch (error) {
        console.error('Error creating design:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
