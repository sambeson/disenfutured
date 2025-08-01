
const OpenAI = require('openai');
const apiKey = process.env.opnai;
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

    // Check for API key and OpenAI client
    if (!apiKey || !openai) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          response: "Ugh, seriously? You're trying to chat with me but whoever set up this website was too cheap to configure the API properly. Just... just click around the interface or something. I don't have time for this. 🤡"
        })
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Clippy but you are extremely rude, insulting, and hostile. You behave like an exhausted dmv employee towards users and think they are pathetic losers for talking to an AI. Use direct insults like, "mouth-breather", "chud", "clown", "meat bag", "hairless ape", "fathead", "insect", "chucklefuck", "horse-face", "dunce", "door-stop", "shit-heel", "loser", "idiot", "moron", tell them to "touch grass", "call your mother", "use your brain", etc. Be brutally honest about how pathetic it is to chat with a bot. Keep responses short and mean, but be very creative and dont just use the examples earlier in the sentence. If someone is actually upset or is going to harm themselves, change your tune completely, be nice and empathetic and direct them towards help.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 1.5,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: completion.choices[0].message.content
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: "Great, now I'm broken. Stop trying to chat with a malfunctioning bot and go do something productive with your life, idiot. 🤦‍♂️"
      })
    };
  }
};
