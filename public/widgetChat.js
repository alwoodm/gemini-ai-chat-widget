/**
 * Gemini Chat Widget
 * A simple chat widget that uses a secure backend to interact with Google's Gemini API
 */
(function() {
    // Configuration
    const config = {
        serverUrl: '', // Will default to current domain if empty
        cssPath: 'widgetChat.css'
    };
    
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
                <h3>Gemini Chat</h3>
                <svg id="closeChat" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
                </svg>
            </div>
            <div class="chat-messages" id="chatMessages">
                <div class="message bot-message">
                    Witaj jestem specjalistą z zakresu wiedzy o Prywatnym Technikum Informatycznym. Czy masz jakieś pytania na które mógłbym ci pomóc odpowiedzieć?
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
            parts: [{text: 'Hello! I\'m your Gemini AI assistant with specialized knowledge. How can I help you today?'}]
        }];
        
        // Determine server URL (if not specified, use current domain)
        if (!config.serverUrl) {
            config.serverUrl = window.location.origin;
        }
        
        // Set up event listeners
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // ...existing code...
    }
    
    // Add a message to the chat
    function addMessage(text, isUser) {
        // ...existing code...
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        // ...existing code...
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        // ...existing code...
    }
    
    // Show error message
    function showError(message) {
        // ...existing code...
    }
    
    // Send message to our secure backend
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
            
            // Send request to our backend server instead of direct to Gemini API
            const response = await fetch(`${config.serverUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: recentHistory
                })
            });
            
            // Remove typing indicator
            hideTypingIndicator();
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            } 
    
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                const botResponse = data.candidates[0].content.parts[0].text;
                // Add bot response to chat
                addMessage(botResponse, false);
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error('Error:', error);
            hideTypingIndicator();
            showError('Sorry, something went wrong. Please try again.');
        }
    }
    
    // Initialize widget when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createChatWidget);
    } else {
        createChatWidget();
    }
})();
