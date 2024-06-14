document.getElementById('fetch-design').addEventListener('click', async () => {
    try {
        const response = await fetch('/create-design');
        const data = await response.json();

        if (typeof window !== 'undefined' && window.canva) {
            const { canva } = window;

            for (let row of data) {
                const design = await canva.designs.create({
                    title: `Cover Letter - ${row['[Recipient Name]']}`,
                    width: 800, 
                    height: 600 
                });

                await design.addText({
                    text: row['[Recipient Name]'],
                    position: { x: 20, y: 40 },
                    style: {
                        fontSize: 14,
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        color: '#000000',
                    },
                });

                await design.addText({
                    text: row['[Company Name]'],
                    position: { x: 20, y: 60 },
                    style: {
                        fontSize: 12,
                        fontFamily: 'Arial',
                        color: '#000000',
                    },
                });

                await design.addText({
                    text: row['[Date]'],
                    position: { x: 20, y: 80 },
                    style: {
                        fontSize: 12,
                        fontFamily: 'Arial',
                        color: '#000000',
                    },
                });

                await design.addText({
                    text: row['[Cover Letter Text]'],
                    position: { x: 20, y: 100 },
                    style: {
                        fontSize: 12,
                        fontFamily: 'Arial',
                        color: '#000000',
                    },
                });

                const context = await design.getContext();
                const pageHeight = context.dimensions.height;

                const draft = await design.read();
                let totalHeight = 0;

                for (const element of draft.contents) {
                    const { top, height } = element.position;
                    totalHeight += (top + height);
                }

                if (totalHeight > pageHeight && row['[Overflow Text]']) {
                    await design.addPage({
                        elements: [
                            {
                                type: 'TEXT',
                                children: [row['[Overflow Text]']],
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

                const exportResponse = await design.export({
                    format: 'PDF',
                });

                const exportUrl = exportResponse.url;
                console.log(`Design exported to: ${exportUrl}`);
            }
        } else {
            throw new Error("Canva SDK is not available in this context.");
        }
    } catch (error) {
        console.error('Error creating Canva design:', error);
    }
});
