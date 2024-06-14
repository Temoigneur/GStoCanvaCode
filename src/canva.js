const { requestExport, createDesign, addPage, getDesign } = require('@canva/design');
require('dotenv').config();

async function createCanvaDesign(data) {
    const designId = process.env.CANVA_DESIGN_ID;
    const design = await getDesign(designId);
    const firstPage = design.pages[0];

    await firstPage.addText({
        text: data.recipientName,
        position: { x: 20, y: 40 },
        style: {
            fontSize: 14,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#000000',
        },
    });

    await firstPage.addText({
        text: data.coverLetterText,
        position: { x: 20, y: 80 },
        style: {
            fontSize: 12,
            fontFamily: 'Arial',
            color: '#000000',
        },
    });

    await firstPage.addText({
        text: data.senderName,
        position: { x: 20, y: 260 },
        style: {
            fontSize: 14,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#000000',
        },
    });

    const overflow = await checkTextOverflow(firstPage);
    if (overflow) {
        await addNewPage(design, data.overflowText);
    }

    const exportUrl = await exportDesign(design);
    console.log(`Design exported to: ${exportUrl}`);
    return exportUrl;
}

async function checkTextOverflow(page) {
    // Logic to check if the text overflows the current page
    return false; // Placeholder
}

async function addNewPage(design, overflowText) {
    const newPage = await addPage({
        elements: [
            {
                type: 'TEXT',
                children: [overflowText],
                width: 100,
                height: 'auto',
                top: 20,
                left: 10,
                style: {
                    fontSize: 12,
                    fontFamily: 'Arial',
                    color: '#000000',
                },
            },
        ],
    });
}

async function exportDesign(design) {
    const response = await requestExport({
        designId: design.id,
        acceptedFileTypes: ['PDF'],
    });
    return response.exportBlobs[0].url;
}

module.exports = { createCanvaDesign };
