const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Improved CORS configuration
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allow only GET and POST requests
    allowedHeaders: ['Content-Type', 'Accept'] // Allow these headers
}));

// Enable preflight requests for all routes
app.options('*', cors());

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Load API keys
let apiKeys = [];
let currentKeyIndex = 0;
let knowledgeBase = '';

// Load configuration
function loadConfig() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            apiKeys = config.apiKeys || [];
            console.log(`Loaded ${apiKeys.length} API keys`);
            
            // Check if API keys are actually present
            if (apiKeys.length === 0) {
                console.warn('Warning: No API keys found in config.json');
            } else if (apiKeys[0] === 'YOUR_API_KEY_1' || apiKeys[0] === 'AIzaSyCejuN0HBFjxoJ4qK5v1alRVmZ5J8H4fPI') {
                console.warn('Warning: You are using a placeholder or potentially invalid API key');
            }
        } else {
            console.warn('config.json not found');
        }
    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// Load knowledge base
function loadKnowledgeBase() {
    try {
        const kbPath = path.join(__dirname, 'knowledge_base.txt');
        if (fs.existsSync(kbPath)) {
            knowledgeBase = fs.readFileSync(kbPath, 'utf8');
            console.log('Knowledge base loaded successfully');
        } else {
            console.warn('knowledge_base.txt not found');
        }
    } catch (error) {
        console.error('Error loading knowledge base:', error);
    }
}

// Get next API key (with rotation)
function getNextApiKey() {
    if (apiKeys.length === 0) {
        throw new Error('No API keys available');
    }
    
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
}

// Test endpoint to verify API keys
app.get('/api/test', async (req, res) => {
    try {
        if (!apiKeys.length) {
            return res.status(500).json({ error: 'No API keys configured' });
        }
        
        const apiKey = getNextApiKey();
        
        // Simple API test
        const testMessage = "Hello, this is a test message to verify the API connection.";
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: testMessage }]
                }]
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Test Error:', errorText);
            
            try {
                const errorJson = JSON.parse(errorText);
                return res.status(response.status).json({ 
                    error: 'API test failed',
                    status: response.status,
                    details: errorJson
                });
            } catch (e) {
                return res.status(response.status).json({ 
                    error: 'API test failed',
                    status: response.status,
                    responseText: errorText
                });
            }
        }
        
        const data = await response.json();
        return res.json({
            success: true,
            message: 'API connection successful',
            response: data
        });
        
    } catch (error) {
        console.error('Error testing API:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;
        
        if (!apiKeys.length) {
            return res.status(500).json({ error: 'No API keys configured' });
        }
        
        console.log('Chat request received. Message history length:', contents.length);
        
        // Try each API key until one works or all fail
        let lastError = null;
        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const apiKey = getNextApiKey();
                
                // Add knowledge base to the first message if it's not already included
                let requestContents = [...contents];
                if (knowledgeBase && !requestContents.some(msg => 
                    msg.role === 'user' && msg.parts[0].text && msg.parts[0].text.includes('knowledge base'))) {
                    requestContents.unshift(
                        {
                            role: 'user',
                            parts: [{
                                text: `I'm providing you with a knowledge base. Please use this information to answer my questions: ${knowledgeBase}`
                            }]
                        },
                        {
                            role: 'model',
                            parts: [{
                                text: `I'll use this knowledge base to answer your questions.`
                            }]
                        }
                    );
                }
                
                console.log(`Trying API key ${i+1}/${apiKeys.length}`);
                
                // Validate and fix message format to ensure compatibility with Gemini API
                requestContents = requestContents.map(msg => {
                    // Ensure parts is an array with at least one object containing text
                    if (!Array.isArray(msg.parts) || msg.parts.length === 0) {
                        msg.parts = [{ text: "" }];
                    } else if (msg.parts[0] === null || typeof msg.parts[0] !== 'object') {
                        msg.parts = [{ text: String(msg.parts[0]) }];
                    } else if (typeof msg.parts[0].text !== 'string') {
                        msg.parts[0].text = msg.parts[0].text ? String(msg.parts[0].text) : "";
                    }
                    
                    // Ensure role is either 'user' or 'model'
                    if (msg.role !== 'user' && msg.role !== 'model') {
                        msg.role = 'user';
                    }
                    
                    return msg;
                });
                
                // Print detailed request for debugging
                console.log('Request contents structure:', JSON.stringify(requestContents));
                
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: requestContents
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API error with key ${i+1}:`, errorText);
                    
                    try {
                        const errorJson = JSON.parse(errorText);
                        // If this is a quota error, try the next key
                        if (response.status === 429) {
                            console.warn(`API key quota exceeded, trying next key...`);
                            continue;
                        }
                        throw new Error(`API responded with status ${response.status}: ${JSON.stringify(errorJson)}`);
                    } catch (e) {
                        throw new Error(`API responded with status ${response.status}: ${errorText}`);
                    }
                }
                
                const responseText = await response.text();
                console.log('Raw API response:', responseText);
                
                try {
                    const data = JSON.parse(responseText);
                    console.log('Successful response received');
                    return res.json(data);
                } catch (parseError) {
                    console.error('Error parsing JSON response:', parseError);
                    throw new Error('Invalid JSON response from API');
                }
            } catch (error) {
                lastError = error;
                console.error(`Error with API key ${i+1}:`, error.message);
            }
        }
        
        // If we get here, all keys failed
        return res.status(500).json({ 
            error: 'All API keys failed',
            details: lastError?.message
        });
        
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Initialize the server
loadConfig();
loadKnowledgeBase();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Test URL: http://localhost:${PORT}/api/test`);
});
