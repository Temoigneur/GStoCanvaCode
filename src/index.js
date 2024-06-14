// index.js
const express = require('express');
const { accessGoogleSheet } = require('./sheets');
const { createCanvaDesign } = require('./canva');

const app = express();
const PORT = 3000;

app.get('/create-design', async (req, res) => {
    try {
        const sheetData = await accessGoogleSheet();
        const designUrl = await createCanvaDesign({
            recipientName: sheetData[0][0], // Adjust based on your sheet structure
            coverLetterText: sheetData[0][1], // Adjust based on your sheet structure
            senderName: sheetData[0][2], // Adjust based on your sheet structure
            overflowText: sheetData[0][3], // Adjust based on your sheet structure
        });
        res.send(`Design created: <a href="${designUrl}">${designUrl}</a>`);
    } catch (error) {
        console.error('Error creating design:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
