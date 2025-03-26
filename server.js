const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

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

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;
        
        if (!apiKeys.length) {
            return res.status(500).json({ error: 'No API keys configured' });
        }
        
        // Try each API key until one works or all fail
        let lastError = null;
        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const apiKey = getNextApiKey();
                
                // Add knowledge base to the first message if it's not already included
                let requestContents = [...contents];
                if (knowledgeBase && !requestContents.some(msg => 
                    msg.role === 'user' && msg.parts[0].text.includes('knowledge base'))) {
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
                    const errorData = await response.json();
                    // If this is a quota error, try the next key
                    if (response.status === 429) {
                        console.warn(`API key quota exceeded, trying next key...`);
                        continue;
                    }
                    throw new Error(`API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
                }
                
                const data = await response.json();
                return res.json(data);
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
        res.status(500).json({ error: error.message });
    }
});

// Initialize the server
loadConfig();
loadKnowledgeBase();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
