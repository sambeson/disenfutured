# Deployment Guide for DISENFUTURED Website

This guide covers how to deploy the website with the Clippy chatbot backend to various hosting platforms.

## Environment Setup

Before deploying, you'll need an OpenAI API key:

1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Generate an API key from the [API Keys page](https://platform.openai.com/api-keys)
3. Set up the environment variable (see platform-specific instructions below)

## Platform Deployment Options

### 1. Vercel (Recommended)

**Automatic Deployment:**
1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and import your repository
3. In the project settings, add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
4. Deploy!

**Manual Deployment:**
```bash
npm install -g vercel
vercel --prod
# Follow prompts and set OPENAI_API_KEY when asked
```

### 2. Heroku

1. Install Heroku CLI and login
2. Create new app:
```bash
heroku create your-app-name
```

3. Set environment variable:
```bash
heroku config:set OPENAI_API_KEY=your_key_here
```

4. Deploy:
```bash
git push heroku main
```

### 3. Railway

1. Visit [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variable in Railway dashboard:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
4. Deploy automatically on push

### 4. DigitalOcean App Platform

1. Create new app from GitHub repo
2. Add environment variable in app settings
3. Deploy with automatic scaling

### 5. Local Development

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API key:
```
OPENAI_API_KEY=your_key_here
PORT=3000
```

3. Install dependencies and run:
```bash
npm install
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Configuration Notes

- The server runs on port 3000 by default
- Set `PORT` environment variable to change port
- Without an API key, the chatbot uses fallback responses
- CORS is enabled for all origins in production

## Troubleshooting

**"API key not found" errors:**
- Ensure `OPENAI_API_KEY` environment variable is set
- Check that the key starts with `sk-`
- Verify the key is active in your OpenAI dashboard

**Server won't start:**
- Check that all dependencies are installed (`npm install`)
- Verify Node.js version is 16+ 
- Check port availability (default 3000)

**Chatbot not responding:**
- Check browser network tab for API errors
- Verify server is running and accessible
- Check environment variable configuration

## Production Checklist

- [ ] OpenAI API key configured as environment variable
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts without errors (`npm start`)
- [ ] Chatbot responds to test messages
- [ ] Static files serve correctly
- [ ] HTTPS enabled (handled by most platforms)
- [ ] Domain configured (optional)

## Support

For deployment issues specific to DISENFUTURED website, contact: disenfutured@gmail.com
