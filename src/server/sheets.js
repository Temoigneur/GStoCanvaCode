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
    const range = 'Sheet1!A1:H1000';

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        console.log('Google Sheets Data:', response.data.values);
        return response.data.values;
    } catch (error) {
        console.error('Error accessing Google Sheets:', error);
        throw error;
    }
}

module.exports = { accessGoogleSheet };
