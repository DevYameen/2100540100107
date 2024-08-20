const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;

const windowSize = 10;
let numberWindow = [];


async function fetchNumbers(type) {
    const apiUrl = `https://third-party-api.com/${type}`; 
    try {
        const response = await axios.get(apiUrl, { timeout: 500 });  
        return response.data.numbers; 
    } catch (error) {
        console.log('Error or timeout fetching data:', error.message);
        return [];
    }
}


function updateWindow(newNumbers) {
    const previousState = [...numberWindow]; 
    const uniqueNumbers = newNumbers.filter(num => !numberWindow.includes(num));

    uniqueNumbers.forEach(num => {
        if (numberWindow.length >= windowSize) {
            numberWindow.shift(); 
        }
        numberWindow.push(num); 
    });

    const sum = numberWindow.reduce((acc, num) => acc + num, 0);
    const avg = numberWindow.length > 0 ? (sum / numberWindow.length).toFixed(2) : 0;

    return { previousState, currentState: [...numberWindow], avg };
}


app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;
    if (!['p', 'f', 'e', 'r'].includes(type)) {
        return res.status(400).send({ error: 'Invalid number type' });
    }

    const newNumbers = await fetchNumbers(type);

    
    const { previousState, currentState, avg } = updateWindow(newNumbers);

   
    return res.status(200).json({
        windowPrevState: previousState,
        windowCurrState: currentState,
        numbers: newNumbers,
        avg: avg
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
