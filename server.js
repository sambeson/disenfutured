const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Environment variables for API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Clippy chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, chatHistory } = req.body;

        if (!OPENAI_API_KEY) {
            // Fallback responses when no API key is set
            return res.json({
                success: true,
                response: getStaticResponse(message)
            });
        }

        const systemPrompt = `You are Clippy, the helpful Microsoft Office assistant, but you're now helping visitors learn about DISENFUTURED, a New Jersey hardcore punk band. Be enthusiastic, slightly quirky like the original Clippy, and always helpful. Use the following information about the band:

Band Members:
- Ben Mazza (Guitar/Vocals)
- Jack Andrus (Keys/Vocals) 
- Sam Beson (Guitar)
- Noah Lipton (Bass)
- Nico Agostini (Drums)

Music: They have demos available on Bandcamp including "Rigged (Demo)" and "Suit (Demo)". A self-titled album is coming in 2025.

Shows: Currently no scheduled shows, but check Instagram @disenfutured for announcements.

Merch: T-shirts ($25), black dad hats ($27), stickers ($3), vinyl preorder ($30). PayPal/Venmo/cash accepted, worldwide shipping.

Contact: disenfutured@gmail.com or Instagram @disenfutured

Keep responses under 3 sentences and always maintain Clippy's helpful, enthusiastic personality. Always end with a helpful suggestion or question.`;

        // Build conversation history for context
        const messages = [
            { role: "system", content: systemPrompt }
        ];
        
        if (chatHistory && Array.isArray(chatHistory)) {
            chatHistory.forEach(msg => {
                messages.push({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.text
                });
            });
        }
        
        messages.push({ role: "user", content: message });

        // Make API call to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 200,
                temperature: 1.5,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        res.json({
            success: true,
            response: reply
        });

    } catch (error) {
        console.error('Chat API error:', error);
        
        // Fallback to static response on error
        res.json({
            success: true,
            response: getStaticResponse(req.body.message)
        });
    }
});

// Static fallback responses
function getStaticResponse(message) {
    const responses = [
        "That's an interesting question! I'm specialized in helping with DISENFUTURED-related topics. Try asking me about their music, band members, shows, merch, or contact information. Or ask me something about this retro website!",
        "Hi there! I'm here to help you learn about DISENFUTURED! They're a hardcore punk band from New Jersey with an awesome retro website. What would you like to know?",
        "Great question! DISENFUTURED has some amazing demos on Bandcamp. Their self-titled album is coming in 2025! Want to know more about the band or their merch?",
        "Looking for DISENFUTURED info? I can tell you about their band members, music, upcoming shows, or merch! What interests you most?",
        "I see you're exploring this Windows 98-style website! Pretty cool, right? I'm here to help you learn about DISENFUTURED. What can I help you with?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
