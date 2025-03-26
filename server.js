const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load API keys from config file
let apiKeys = [];
try {
  const keysConfig = require('./config/keys');
  apiKeys = keysConfig.apiKeys;
} catch (error) {
  console.error('Error loading API keys:', error);
}

// Current API key index
let currentKeyIndex = 0;

// Knowledge base content
let knowledgeBaseContent = '';
try {
  knowledgeBaseContent = fs.readFileSync(
    path.join(__dirname, 'knowledge_base.txt'),
    'utf8'
  );
  console.log('Knowledge base loaded successfully');
} catch (error) {
  console.error('Error loading knowledge base:', error);
}

// Get next available API key
function getNextApiKey() {
  if (apiKeys.length === 0) {
    return null;
  }
  
  const key = apiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return key;
}

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { contents } = req.body;
    
    // Add knowledge base as context
    let requestContents = [];
    if (knowledgeBaseContent) {
      requestContents.push(
        {
          role: 'user',
          parts: [{
            text: `I'm providing you with a knowledge base. Please use this information to answer my questions: ${knowledgeBaseContent}`
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
    
    // Add the conversation history
    requestContents = [...requestContents, ...contents];
    
    // Try each API key until one works
    let apiResponse = null;
    let allKeysFailed = true;
    
    // Try each key up to the number of keys we have
    for (let attempt = 0; attempt < apiKeys.length; attempt++) {
      const apiKey = getNextApiKey();
      if (!apiKey) {
        break;
      }
      
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: requestContents
            })
          }
        );
        
        if (response.ok) {
          apiResponse = await response.json();
          allKeysFailed = false;
          break;
        }
      } catch (error) {
        console.error(`Error with API key attempt ${attempt + 1}:`, error.message);
      }
    }
    
    if (allKeysFailed) {
      return res.status(500).json({ error: 'All API keys have failed' });
    }
    
    res.json(apiResponse);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move widget files to public directory
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

// Copy CSS file to public directory if it doesn't exist
const cssSource = path.join(__dirname, 'widgetChat.css');
const cssDestination = path.join(__dirname, 'public', 'widgetChat.css');
if (fs.existsSync(cssSource) && !fs.existsSync(cssDestination)) {
  fs.copyFileSync(cssSource, cssDestination);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
