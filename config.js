// Configuration for Clippy Chatbot
// To enable ChatGPT integration:
// 1. Get an API key from https://platform.openai.com/api-keys
// 2. Create a copy of this file named 'config.local.js'
// 3. Add your API key to the OPENAI_API_KEY field in config.local.js
// 4. The config.local.js file will be ignored by git for security

const CLIPPY_CONFIG = {
    // Replace with your OpenAI API key
    OPENAI_API_KEY: '',
    
    // Optional: Customize the AI model
    MODEL: 'gpt-3.5-turbo',
    
    // Optional: Adjust response length (max tokens)
    MAX_TOKENS: 200,
    
    // Optional: Adjust creativity (0.0 to 2.0)
    TEMPERATURE: 1.5
};

// Note: If no API key is provided, Clippy will use built-in responses
// about DISENFUTURED instead of ChatGPT integration
