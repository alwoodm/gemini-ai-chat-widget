# Gemini AI Chat widget

An interactive AI chat widget that can be easily integrated with any website. The Express.js backend ensures secure storage of API keys and provides a seamless AI chat experience for your website visitors.

## Features

- Ready-to-use chat widget that appears in the bottom right corner of your website
- Secure backend architecture that protects your API keys from exposure
- Support for multiple Gemini API keys with automatic rotation when quota limits are reached
- Simple knowledge base configuration for customizing AI responses
- Responsive design that works on both desktop and mobile devices
- Typing indicators and error handling for improved user experience
- Easy integration with any website using a single script tag

## How It Works

This project consists of two main components:

1. **Backend Server**: An Express.js server that handles communication with the Google Gemini API, manages API keys, and serves the widget files.
2. **Frontend Widget**: A JavaScript widget that injects a chat interface into your website and communicates with the backend.

The architecture ensures that your API keys remain secure on the server and are never exposed to end users.

## Requirements

- Node.js (version 14 or newer)
- Google Gemini API key(s)
- Web server for hosting (or local development environment)

## Installation

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/alwoodm/interactive-web-ai-widget.git
cd interactive-web-ai-widget
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys:
   - Open the `config.json` file
   - Replace the placeholder with your actual Gemini API key(s):
   ```json
   {
     "apiKeys": [
       "YOUR_ACTUAL_API_KEY_HERE",
       "YOUR_SECONDARY_API_KEY_HERE"  // Optional
     ]
   }
   ```

4. Customize the knowledge base:
   - Edit the `knowledge_base.txt` file to include information specific to your company/project
   - The AI will use this information when responding to user queries

5. Start the server:
```bash
npm start
```

6. Test the widget:
   - Open http://localhost:3000/test-api.html to test your API connection

### Production Deployment

For production use, you should:

1. Deploy the server to a hosting service (Heroku, AWS, DigitalOcean, etc.)
2. Ensure your server has HTTPS enabled for secure communication
3. Update the widget URL in your website integration to point to your production server

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" in the API Keys section
4. Copy the generated key and add it to your `config.json` file

## Website Integration

To add the widget to your website, include the following script tag in your HTML:

```html
<script src="http://localhost:3000/widgetChat.js" data-backend="https://localhost:3000" defer></script>
```

For production, update the URL to point to your hosted server:

```html
<script src="https://your-server.com/widgetChat.js" data-backend="https://your-api-server.com" defer></script>
```

### Custom Backend Configuration

You can specify a custom backend URL using the `data-backend` attribute on the script tag:

```html
<script src="https://your-server.com/widgetChat.js" data-backend="https://your-api-server.com" defer></script>
```

This is useful when:

- Your widget files and API backend are hosted on different servers
- You're testing with a development backend but using production widget files
- You need to route API requests through a specific proxy or gateway

If the `data-backend` attribute is not specified, the widget will automatically use the same domain from which the script is loaded.

## Configuration Options

### Backend Configuration (server.js)

You can modify the server behavior by editing `server.js`:

- Change the port by modifying the `PORT` variable
- Customize CORS settings for specific domains
- Modify API request handling

### Widget Settings (widgetChat.js)

In the `widgetChat.js` file, you can customize:

```javascript
const config = {
    backendUrl: 'http://localhost:3000', // Change to your server address
    cssPath: 'widgetChat.css'            // Path to CSS file
};
```

### Widget Appearance (widgetChat.css)

The widget's appearance is highly customizable through CSS variables:

```css
:root {
    --primary-color: #4285f4;    /* Main color */
    --secondary-color: #f1f3f4;  /* Message background color */
    --text-color: #202124;       /* Text color */
    --light-text: #5f6368;       /* Lighter text color */
    --border-radius: 12px;       /* Corner radius */
    --widget-z-index: 999999;    /* Z-index to control layering */
}
```

Additional CSS can be added to the file to further customize the widget's appearance.

## Personalization and Rebranding

You can customize the appearance and behavior of the chat widget to match your brand identity:

### Changing the Initial Greeting

To modify the first message users see when opening the chat:

1. Edit `widgetChat.js` and `public/widgetChat.js` to change the greeting message:

```javascript
// In both widgetChat.js and public/widgetChat.js files
// Find this section:
chatContainer.innerHTML = `
    <div class="chat-header">
        <h3>AI Assistant</h3>
        // ...existing code...
    </div>
    <div class="chat-messages" id="chatMessages">
        <div class="message bot-message">
            Hello! I'm an AI assistant. How can I help you today?
        </div>
    </div>
    // ...existing code...
`;

// Also update the chat history initialization:
chatHistory = [{
    role: 'model',
    parts: [{text: 'Hello! I\'m an AI assistant. How can I help you today?'}]
}];
```

Change these messages to your desired greeting, for example:
```javascript
<div class="message bot-message">
    Cześć! Jestem Twoim asystentem PTI. W czym mogę Ci pomóc?
</div>

// And update history initialization:
chatHistory = [{
    role: 'model',
    parts: [{text: 'Cześć! Jestem Twoim asystentem PTI. W czym mogę Ci pomóc?'}]
}];
```

### Changing the Chat Title

1. Edit the header title in both `widgetChat.js` and `public/widgetChat.js`:

```javascript
<div class="chat-header">
    <h3>PTI Assistant</h3>
    // ...existing code...
</div>
```

### Customizing the Knowledge Base Instructions

1. Edit `knowledge_base.txt` to modify the instructions that guide AI responses:

## Cleaning Up and Version Control

If you've accidentally committed the `node_modules` directory or other unnecessary files to your repository, follow these steps to clean up:

### Initial Repository Setup

1. Create a `.gitignore` file (already included in this repository)
2. Remove node_modules from git tracking:

```bash
# Remove node_modules from git tracking without deleting it locally
git rm -r --cached node_modules
git commit -m "Remove node_modules from version control"

# Other cleanup commands
# Remove any untracked files and directories
git clean -fd

# Remove any unused files from the repository
npm prune
```

### Regular Maintenance

Use these commands to keep your repository clean:

```bash
# Remove development dependencies when deploying to production
npm prune --production

# Clear npm cache if you're experiencing package issues
npm cache clean --force
```

### Deployment Considerations

When deploying to production, consider these best practices:

- Only include production dependencies (use `npm ci` rather than `npm install`)
- Set NODE_ENV=production to optimize performance
- Use a proper CI/CD pipeline to build and deploy your application

## Docker Deployment

To run the application in Docker, follow these steps:

### Docker Setup

1. Make sure you have Docker and Docker Compose installed on your system.

2. Build and start the container:
```bash
docker-compose up -d
```

3. The application will be available at http://localhost:3000

### Using Docker for Development

For development with hot-reloading:

1. Modify the docker-compose.yml file to mount the source code as a volume:
```yaml
volumes:
  - .:/app
  - /app/node_modules
```

2. Run the container with the development command:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Docker Production Considerations

For production environments:

1. Ensure your API keys are properly configured in config.json before building the image
2. Consider using Docker secrets or environment variables for sensitive information
3. Set the NODE_ENV environment variable to 'production' in your Dockerfile
4. Use a reverse proxy like Nginx or Traefik in front of the application for HTTPS support
