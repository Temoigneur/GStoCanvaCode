require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const { accessGoogleSheet } = require('./src/server/sheets');
const { createCanvaDesign } = require('./src/server/canva');

const app = express();
const PORT = 3005;

console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET);

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `http://localhost:${PORT}/auth/callback`
);

app.get('/auth', (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    console.log('Generated auth URL:', url);
    res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    console.log('Authorization code:', code);
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Tokens received:', tokens);
        req.session.tokens = tokens;
        oauth2Client.setCredentials(tokens);
        res.redirect('/create-design');
    } catch (error) {
        console.error('Error retrieving access token:', error);
        res.status(400).send('Invalid Request');
    }
});

app.get('/create-design', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth');
    }

    oauth2Client.setCredentials(req.session.tokens);

    try {
        const sheetData = await accessGoogleSheet();
        console.log('Sheet Data:', sheetData);

        const designUrls = [];
        for (let row of sheetData) {
            const designData = {
                recipientName: row[0],
                companyName: row[1],
                date: row[2],
                coverLetterText: row[3],
                overflowText: row[4] || '',
            };
            console.log('Design Data:', designData);

            const designUrl = await createCanvaDesign(designData);
            console.log('Created design URL:', designUrl);
            designUrls.push(designUrl);
        }
        res.send(`Designs created successfully: ${designUrls.join(', ')}`);
    } catch (error) {
        console.error('Error creating design:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
