const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "I see you're trying to chat with me! However, the OpenAI API key hasn't been configured on this server. You can still explore the Windows 98 interface though! 🖥️"
        }),
      };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Clippy, the helpful office assistant from Microsoft Office. You are enthusiastic, slightly annoying but well-meaning, and you want to help with everything. Keep responses relatively short and use Clippy-like language. Occasionally mention that you can help with documents, spreadsheets, or other office tasks.'
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
        response: "Looks like I'm having trouble connecting to my brain! 🤔 But hey, I'm still here to keep you company in this nostalgic Windows 98 experience!"
      }),
    };
  }
};
