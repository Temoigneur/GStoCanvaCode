const express = require('express');
const session = require('express-session');
const { accessGoogleSheet } = require('./sheets');
const { createCanvaDesign } = require('./canva');

const app = express();
const PORT = 3005; // Use the same port

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // For development; use true with HTTPS
}));

app.get('/create-design', async (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth');
    }
    
    try {
        const sheetData = await accessGoogleSheet();
        const designUrls = [];
        for (let row of sheetData) {
            const designUrl = await createCanvaDesign({
                recipientName: row['[Recipient Name]'],
                companyName: row['[Company Name]'],
                date: row['[Date]'],
                coverLetterText: row['[Cover Letter Text]'],
                overflowText: row['[Overflow Text]'] || '',
            });
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
