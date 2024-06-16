import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
    const [designUrls, setDesignUrls] = useState<string[]>([]);

    const createDesigns = async () => {
        try {
            const response = await fetch('/create-design');
            const data = await response.json();
            setDesignUrls(data);
        } catch (error) {
            console.error('Error creating designs:', error);
        }
    };

    useEffect(() => {
        createDesigns();
    }, []);

    return (
        <div>
            <h1>Designs Created:</h1>
            <ul>
                {designUrls.map((url, index) => (
                    <li key={index}><a href={url} target="_blank" rel="noopener noreferrer">Design {index + 1}</a></li>
                ))}
            </ul>
        </div>
    );
};

export default App;
