const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const { accessGoogleSheet } = require('./sheets');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;
const BACKEND_URL = process.env.BACKEND_URL || `https://localhost:${PORT}`;
const CANVA_APP_ORIGIN = 'https://app-aagieajdpoo.canva-apps.com'; // Canva app origin

// Configure CORS to allow requests from the Canva app origin
app.use(cors({
    origin: CANVA_APP_ORIGIN,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.static(path.join(__dirname, '../../public')));

// Mock function to simulate Canva API response
const getCanvaAccessToken = async (authCode) => {
    console.log('Mocking Canva access token retrieval');
    return 'mock-access-token';
};

const createCanvaDesign = async (accessToken, data) => {
    console.log('Mocking Canva design creation');
    return 'http://mock-canva-design-url.com';
};

app.get('/auth', (req, res) => {
    const authUrl = `https://api.product.canva.com/v1/oauth2/auth?client_id=${process.env.CLIENT_ID}&redirect_uri=${BACKEND_URL}/callback&response_type=code&scope=user.read`;
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

if (process.env.NODE_ENV === 'production') {
    // In production, use the Vercel-provided server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} else {
    // In development, use HTTPS with self-signed certificate
    const options = {
        key: fs.readFileSync('server.key'),
        cert: fs.readFileSync('server.cert')
    };

    https.createServer(options, app).listen(PORT, () => {
        console.log(`Server is running on https://localhost:${PORT}`);
    });
}
