const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('utf-8')),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const client = auth.getClient();
const googleSheets = google.sheets({ version: 'v4', auth: client });
const spreadsheetId = process.env.SPREADSHEET_ID;

async function accessGoogleSheet() {
    try {
        const response = await googleSheets.spreadsheets.values.get({
            auth,
            spreadsheetId,
            range: 'GS-Canva!A1:H600',
        });
        return response.data.values;
    } catch (error) {
        console.error('Error accessing Google Sheet:', error);
        throw error;
    }
}

module.exports = { accessGoogleSheet };
