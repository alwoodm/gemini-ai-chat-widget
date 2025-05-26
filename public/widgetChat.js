/**
 * Chat Widget
 * A simple chat widget that connects to a backend server for AI responses
 */
(function() {
    // Automatic backend URL detection based on script location
    function detectBackendUrl() {
        // 1. Try to detect based on data-backend attribute on the script tag
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('widgetChat.js')) {
                if (scripts[i].hasAttribute('data-backend')) {
                    return scripts[i].getAttribute('data-backend');
                }
                
                // 2. Use the same domain/server from which the script is loaded
                const scriptUrl = new URL(scripts[i].src);
                return `${scriptUrl.protocol}//${scriptUrl.host}`;
            }
        }
        
        // 3. If we cannot detect from script, use current domain
        return window.location.origin;
    }
    
    // Configuration
    const config = {
        // Automatically detect backend address
        backendUrl: detectBackendUrl(),
        cssPath: 'widgetChat.css'
    };
    
    // Display detected address in console for debugging purposes
    console.log('Detected backend URL:', config.backendUrl);
    
    let knowledgeBaseContent = '';
    let chatHistory = [];
    
    // Create and inject the HTML structure
    function createChatWidget() {
        // Load the CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = config.cssPath;
        document.head.appendChild(link);
        
        // Create chat toggle button
        const chatToggle = document.createElement('div');
        chatToggle.className = 'chat-toggle';
        chatToggle.id = 'chatToggle';
        chatToggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="white"/>
            </svg>
        `;
        
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container hidden';
        chatContainer.id = 'chatContainer';
        chatContainer.innerHTML = `
            <div class="chat-header">
                <h3>AI Assistant</h3>
                <svg id="closeChat" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
                </svg>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="message bot-message">
                    Hello! I'm an AI assistant. How can I help you today?
                </div>
            </div>
            <div class="chat-input">
                <input type="text" id="userInput" placeholder="Type your message..." />
                <button class="send-button" id="sendButton">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Append to body
        document.body.appendChild(chatToggle);
        document.body.appendChild(chatContainer);
        
        // Initialize chat history
        chatHistory = [{
            role: 'model',
            parts: [{text: 'Hello! I\'m an AI assistant. How can I help you today?'}]
        }];
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Load knowledge base content from file
    function loadKnowledgeBase() {
        // Knowledge base now loaded from backend
    }
    
    // Set up event listeners
    function setupEventListeners() {
        const chatToggle = document.getElementById('chatToggle');
        const chatContainer = document.getElementById('chatContainer');
        const closeChat = document.getElementById('closeChat');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');
        
        // Toggle chat widget
        chatToggle.addEventListener('click', function() {
            chatContainer.classList.remove('hidden');
            chatToggle.classList.add('hidden');
            userInput.focus();
        });
        
        // Close chat
        closeChat.addEventListener('click', function() {
            chatContainer.classList.add('hidden');
            chatToggle.classList.remove('hidden');
        });
        
        // Send message on button click
        sendButton.addEventListener('click', sendMessage);
        
        // Send message on Enter key
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Add a message to the chat
    function addMessage(text, isUser) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to chat history
        chatHistory.push({
            role: isUser ? 'user' : 'model',
            parts: [{text: text}]
        });
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.id = 'typingIndicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            indicator.appendChild(dot);
        }
        
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    // Show error message
    function showError(message) {
        const chatMessages = document.getElementById('chatMessages');
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        errorDiv.textContent = message;
        chatMessages.appendChild(errorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Send message to backend API
    async function sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Prepare context messages (last few messages for history)
            // Limit to last 10 messages to avoid token limits
            const recentHistory = chatHistory.slice(-10);
            
            console.log('Sending message to backend, URL:', `${config.backendUrl}/api/chat`);
            
            // Send to backend API - improved error handling
            let response;
            try {
                response = await fetch(`${config.backendUrl}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: recentHistory
                    }),
                    mode: 'cors' // Explicitly set CORS mode
                });
            } catch (fetchError) {
                console.error('Network error during fetch:', fetchError);
                throw new Error(`Network error: ${fetchError.message}. Make sure the server is running at ${config.backendUrl}`);
            }
            
            // Remove typing indicator
            hideTypingIndicator();
            
            let responseText = '';
            try {
                responseText = await response.text();
                console.log('Raw server response:', responseText);
            } catch (textError) {
                console.error('Error reading response text:', textError);
                throw new Error('Failed to read server response');
            }
            
            if (!response.ok) {
                let errorMessage = 'Server responded with an error';
                try {
                    if (responseText) {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error || `Server responded with status ${response.status}`;
                        console.error('Error details:', errorData);
                    } else {
                        errorMessage = `Server responded with status ${response.status}`;
                    }
                } catch (e) {
                    errorMessage = `Server responded with status ${response.status}: ${responseText}`;
                }
                throw new Error(errorMessage);
            } 

            try {
                const data = JSON.parse(responseText);
                
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const botResponse = data.candidates[0].content.parts[0].text;
                    // Add bot response to chat
                    addMessage(botResponse, false);
                } else {
                    console.error('Invalid response format:', data);
                    throw new Error('Invalid response format from API');
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError, responseText);
                throw new Error('Failed to parse server response');
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            showError(`Sorry, something went wrong: ${error.message}`);
        }
    }
    
    // Initialize widget when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatWidget);
    } else {
        createChatWidget();
    }
})();