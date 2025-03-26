# Interactive Web AI Widget

An interactive AI chat widget that can be easily integrated with any website. The Express.js backend ensures secure storage of API keys.

## Features

- Chat widget placed in the bottom right corner of the page
- Support for multiple Gemini API keys (automatic rotation when limits are reached)
- Secure backend that hides API keys from users
- Simple knowledge base configuration for the AI assistant

## Requirements

- Node.js (version 14 or newer)
- Google Gemini API keys

## Installation

1. Clone the repository:
```bash
git clone [repository-address]
cd interactive-web-ai-widget
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys:
   - Open the `config.json` file
   - Add your API keys to the `apiKeys` array

4. Customize the knowledge base:
   - Open the `knowledge_base.txt` file
   - Fill in the sections with information specific to your company/project

5. Start the server:
```bash
npm start
```

## Website Integration

To integrate the widget with your website, add the following HTML code:

```html
<script src="http://localhost:3000/widgetChat.js" defer></script>
```

Adjust the URL to the address where your server is running.

## Configuration

### Widget Settings (widgetChat.js)

In the `widgetChat.js` file, you can customize the following parameters:

```javascript
const config = {
    backendUrl: 'http://localhost:3000', // Change to your server address
    cssPath: 'widgetChat.css'            // Path to CSS file
};
```

### Widget Appearance (widgetChat.css)

You can customize the widget's style by editing the `widgetChat.css` file. The main CSS variables are:

```css
:root {
    --primary-color: #4285f4;    /* Main color */
    --secondary-color: #f1f3f4;  /* Message background color */
    --text-color: #202124;       /* Text color */
    --light-text: #5f6368;       /* Lighter text color */
    --border-radius: 12px;       /* Corner radius */
}
```

## Project Structure

- `server.js` - Main Express server file
- `widgetChat.js` - Frontend script for the widget
- `widgetChat.css` - CSS styles for the widget
- `knowledge_base.txt` - Knowledge base for the AI assistant
- `config.json` - Configuration file with API keys
- `public/` - Folder with static files

## License

Free commercial use