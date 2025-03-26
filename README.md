# Interactive Web AI Widget

Interactive AI assistant widget for your website with secure backend processing.

## Features

- Interactive chat widget powered by Google's Gemini API
- Secure backend processing to protect API keys
- Support for multiple API keys with automatic fallback
- Knowledge base managed on the server

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure your API keys:
   - Edit `config/keys.js` to add your Gemini API keys
   - The system will automatically rotate between keys if one fails

3. Update your knowledge base:
   - Edit `knowledge_base.txt` with your specific content

4. Start the server:
   ```
   npm start
   ```

5. Embed the widget on your website:
   ```html
   <script src="http://your-server-address:3000/widgetChat.js"></script>
   ```

## Security

- API keys are stored securely on the server
- Knowledge base is processed on the backend
- All API requests are proxied through your server
