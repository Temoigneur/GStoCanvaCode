// src/server/sheets.js
const { google } = require('googleapis');
require('dotenv').config();

async function accessGoogleSheet() {
    const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const range = 'Sheet1!A1:D1';

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    return response.data.values;
}

module.exports = { accessGoogleSheet };
