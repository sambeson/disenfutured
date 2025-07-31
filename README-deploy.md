# DISENFUTURED Website Setup

## Live Setup Instructions

### 1. Set up your environment file
Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the server
```bash
npm start
```

The website will be available at `http://localhost:3000`

## Deployment Options

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variable `OPENAI_API_KEY` in Vercel dashboard
4. Deploy

### Heroku
1. Create Heroku app
2. Set config var: `heroku config:set OPENAI_API_KEY=your_key_here`
3. Push to Heroku

### Railway
1. Connect GitHub repo
2. Add environment variable `OPENAI_API_KEY`
3. Deploy

## Features

- **Authentic Windows 98 Interface**: Complete with taskbar, start menu, and draggable windows
- **Interactive Clippy Chatbot**: Powered by OpenAI GPT-3.5-turbo
- **Band Information Hub**: Everything about DISENFUTURED
- **Secure API Integration**: API key safely stored server-side
- **Fallback System**: Works even without API key using static responses

## Security

- API keys are stored server-side only
- No client-side exposure of sensitive credentials
- Fallback responses ensure functionality without API access
- CORS protection enabled

## Customization

Edit the band information in `server.js` to update Clippy's knowledge base.
