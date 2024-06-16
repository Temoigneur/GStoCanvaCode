const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { google } = require('googleapis');
const { getCanvaAccessToken, createCanvaDesign } = require('./canva');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.static(path.join(__dirname, '../../public')));

// Log environment variables to verify they are loaded correctly
console.log('GOOGLE_APPLICATION_CREDENTIALS_JSON:', process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
console.log('CLIENT_ID:', process.env.CLIENT_ID);
console.log('CLIENT_SECRET:', process.env.CLIENT_SECRET);
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function accessGoogleSheet() {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = 'YOUR_SPREADSHEET_ID'; // replace with your actual spreadsheet ID
    const range = 'Sheet1!A1:D10'; // replace with your actual range

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    return response.data.values;
}

app.get('/auth', (req, res) => {
    const authUrl = `https://api.product.canva.com/v1/oauth2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=user.read`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const authCode = req.query.code;
    try {
        const accessToken = await getCanvaAccessToken(authCode);
        const sheetData = await accessGoogleSheet();
        const designUrl = await createCanvaDesign(accessToken, {
            recipientName: sheetData[0][0],
            coverLetterText: sheetData[0][1],
            senderName: sheetData[0][2],
            overflowText: sheetData[0][3],
        });
        res.json({ designUrl });
    } catch (error) {
        console.error('Error creating design:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/create-design', async (req, res) => {
    try {
        const sheetData = await accessGoogleSheet();
        const designUrl = await createCanvaDesign('mock-access-token', {
            recipientName: sheetData[0][0], // Adjust based on your sheet structure
            coverLetterText: sheetData[0][1], // Adjust based on your sheet structure
            senderName: sheetData[0][2], // Adjust based on your sheet structure
            overflowText: sheetData[0][3], // Adjust based on your sheet structure
        });
        res.json({ designUrl });
    } catch (error) {
        console.error('Error creating design:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});
