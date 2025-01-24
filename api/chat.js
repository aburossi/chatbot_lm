export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { messages, system_prompt } = await req.json();
    
    const fullMessages = [
      { role: "system", content: system_prompt },
      ...messages.filter(msg => msg.role !== 'system')
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await openaiResponse.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}