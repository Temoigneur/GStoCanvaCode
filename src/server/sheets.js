// sheets.js
const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_FILE,
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
      range: 'GS-Canva!A1:D10',
    });

    return response.data.values;
  } catch (error) {
    console.error('Error accessing Google Sheet:', error);
    throw error;
  }
}

module.exports = { accessGoogleSheet };
