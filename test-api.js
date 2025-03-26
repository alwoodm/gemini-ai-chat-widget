const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load API key from config
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const apiKey = config.apiKeys[0];

// Simple test message
const testMessage = "Hello, how are you today?";
const requestBody = {
    contents: [{
        role: 'user',
        parts: [{ text: testMessage }]
    }]
};

console.log('Sending test request to Gemini API...');
console.log('Request body:', JSON.stringify(requestBody, null, 2));

fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
})
.then(async response => {
    const responseText = await response.text();
    console.log('Response status:', response.status);
    
    if (!response.ok) {
        console.error('Error response:', responseText);
        process.exit(1);
    }
    
    try {
        const data = JSON.parse(responseText);
        console.log('Success! Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
    }
})
.catch(error => {
    console.error('Request failed:', error);
});
