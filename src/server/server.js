const express = require('express');
const session = require('express-session');
const { accessGoogleSheet, oauth2Client, scopes } = require('./sheets');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005; // Use environment variable PORT if available

app.use(express.static('public'));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable for session secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure cookies in production
}));

app.get('/auth', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(url);
});

app.get('/oauth2callback', async (req, res) => {
    try {
        const { tokens } = await oauth2Client.getToken(req.query.code);
        oauth2Client.setCredentials(tokens);
        req.session.tokens = tokens;
        res.send('Authentication successful! You can close this window.');
    } catch (error) {
        console.error('Error during OAuth2 callback:', error);
        res.status(500).send('Authentication failed');
    }
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
