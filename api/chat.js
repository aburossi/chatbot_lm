export const config = {
    runtime: 'edge',
  };
  
  export default async function handler(req) {
    const { messages, system_prompt } = await req.json();
    
    // Add system prompt to messages
    const fullMessages = [
      { role: "system", content: system_prompt },
      ...messages.filter(msg => msg.role !== 'system')
    ];
  
    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });
  }