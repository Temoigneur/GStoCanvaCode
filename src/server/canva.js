const fetch = require('node-fetch');
const nock = require('nock');

if (process.env.MOCK_CANVA_API === 'true') {
    nock('https://api.canva.com')
        .persist()
        .post('/v1/designs')
        .reply(200, {
            url: 'https://mocked.canva.design/url'
        });
}

async function createCanvaDesign(data) {
    try {
        const response = await fetch('https://api.canva.com/v1/designs', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CANVA_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                templateId: 'DAGIVDynLB4',
                elements: [
                    {
                        type: 'text',
                        id: 'placeholder1',
                        content: data.coverLetterText,
                    },
                    {
                        type: 'text',
                        id: 'placeholder2',
                        content: data.overflowText,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error creating Canva design: ${response.status} - ${errorText}`);
        }

        const design = await response.json();
        console.log('Canva Design Response:', design);
        return design.url;
    } catch (error) {
        console.error('Error creating Canva design:', error);
        throw error;
    }
}

module.exports = {
    createCanvaDesign,
};
