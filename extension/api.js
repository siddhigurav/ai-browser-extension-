// api.js - minimal OpenRouter API client
const OpenRouterAPI = (function(){
  const API_URL = 'https://api.openrouter.ai/v1/chat/completions';

  async function callOpenRouter(apiKey, model, messages) {
    if (!apiKey) throw new Error('API key missing');
    const body = {
      model: model,
      messages: messages
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenRouter error: ${res.status} ${txt}`);
    }
    const data = await res.json();
    // expect data.choices[0].message.content or similar
    try {
      const choice = data.choices && data.choices[0];
      if (!choice) throw new Error('No choices returned');
      const content = choice.message ? choice.message.content : (choice.text || '');
      return content;
    } catch (e) {
      throw new Error('Unexpected OpenRouter response');
    }
  }

  return { callOpenRouter };
})();
