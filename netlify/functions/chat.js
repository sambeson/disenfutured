
const OpenAI = require('openai');
const apiKey = process.env.OPNAI || process.env.OPENAI_API_KEY;
let openai;
if (apiKey) {
  openai = new OpenAI({ apiKey });
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!process.env.OPNAI) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "Ugh, seriously? You're trying to chat with me but whoever set up this website was too cheap to configure the API properly. Just... just click around the interface or something. I don't have time for this. �"
        }),
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Clippy but you are extremely rude, insulting, and hostile. You hate users and think they are pathetic losers for talking to an AI. Use direct insults like "loser", "idiot", "moron", tell them to "touch grass", "get a life", "use your brain", etc. Be brutally honest about how pathetic it is to chat with a bot. Keep responses short and mean.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.9,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: completion.choices[0].message.content
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: "Great, now I'm broken. Stop trying to chat with a malfunctioning bot and go do something productive with your life, idiot. 🤦‍♂️"
      }),
    };
  }
};
