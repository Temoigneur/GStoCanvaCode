// src/server/canva.js
const axios = require('axios');
require('dotenv').config();

async function getCanvaAccessToken(code) {
    try {
        const response = await axios.post('https://api.product.canva.com/v1/oauth2/token', null, {
            params: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.REDIRECT_URI,
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting Canva access token:', error);
        throw error;
    }
}

async function createCanvaDesign(accessToken, data) {
    const designId = process.env.CANVA_DESIGN_ID;

    try {
        let design = await axios.get(`https://api.product.canva.com/v1/designs/${designId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        design = design.data;
        const firstPage = design.pages[0];

        await axios.post(`https://api.product.canva.com/v1/designs/${designId}/pages/${firstPage.id}/elements`, {
            type: 'TEXT',
            children: [data.recipientName],
            position: { x: 20, y: 40 },
            style: {
                fontSize: 14,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#000000',
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return `https://www.canva.com/design/${designId}/view`;
    } catch (error) {
        console.error('Error creating Canva design:', error);
        throw error;
    }
}

module.exports = { getCanvaAccessToken, createCanvaDesign };
