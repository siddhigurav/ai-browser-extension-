// api/apiClient.js - wrapper used by background.js
// Exports: callModel(payload, token) => returns an object or throws on fatal errors.
// Behavior:
// - If payload.provider is set it will be used ('openai' or 'huggingface')
// - Otherwise provider is detected from token prefix (hf_ => huggingface, sk- => openai)
// - Returns a parsed object: { text, raw }

export function detectProvider(payload = {}, token = '') {
  console.log('detectProvider called with:', { payload, token });
  
  if (payload.provider) {
    console.log('Using provider from payload:', payload.provider);
    return payload.provider;
  }
  
  if (typeof token === 'string') {
    if (token.startsWith('hf_')) {
      console.log('Detected Hugging Face token');
      return 'huggingface';
    }
    if (token.startsWith('sk-') || token.includes('openai')) {
      console.log('Detected OpenAI token');
      return 'openai';
    }
    if (token.startsWith('gsk_')) {
      console.log('Detected GROQ token');
      return 'groq'; // GROQ tokens start with gsk_
    }
    if (token.startsWith('openrouter-')) {
      console.log('Detected OpenRouter token');
      return 'openrouter'; // OpenRouter tokens
    }
  }
  
  // Check if we're using a free OpenRouter model
  const selectedModel = payload.selectedModel || payload.model;
  const freeModels = [
    'openchat/openchat-7b',
    'mistralai/mistral-7b-instruct',
    'google/gemma-7b-it',
    'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    'microsoft/phi-3-medium-128k-instruct',
    'meta-llama/llama-3-8b-instruct'
  ];
  
  if (selectedModel && freeModels.includes(selectedModel)) {
    console.log('Using free OpenRouter model');
    return 'openrouter';
  }
  
  // default to openrouter for production usage (free models)
  console.log('Defaulting to openrouter');
  return 'openrouter';
}

// Define model configurations
const MODEL_CONFIGS = {
  // GROQ Models
  'llama-3.1-8b-instant': { provider: 'groq', model: 'llama-3.1-8b-instant' },
  'llama-3.1-70b-versatile': { provider: 'groq', model: 'llama-3.1-70b-versatile' },
  'llama-3.2-1b-preview': { provider: 'groq', model: 'llama-3.2-1b-preview' },
  'llama-3.2-3b-preview': { provider: 'groq', model: 'llama-3.2-3b-preview' },
  'llama-3.2-11b-vision-preview': { provider: 'groq', model: 'llama-3.2-11b-vision-preview' },
  'llama-3.2-90b-vision-preview': { provider: 'groq', model: 'llama-3.2-90b-vision-preview' },
  'llama-3.3-70b': { provider: 'groq', model: 'llama-3.3-70b' },
  'mixtral-8x7b-32768': { provider: 'groq', model: 'mixtral-8x7b-32768' },
  'gemma-7b-it': { provider: 'groq', model: 'gemma-7b-it' },
  'gemma2-9b-it': { provider: 'groq', model: 'gemma2-9b-it' },
  
  // Hugging Face Models
  'gpt2': { provider: 'huggingface', model: 'gpt2' },
  'facebook/opt-1.3b': { provider: 'huggingface', model: 'facebook/opt-1.3b' },
  'facebook/opt-6.7b': { provider: 'huggingface', model: 'facebook/opt-6.7b' },
  'google/flan-t5-small': { provider: 'huggingface', model: 'google/flan-t5-small' },
  'google/flan-t5-base': { provider: 'huggingface', model: 'google/flan-t5-base' },
  'google/flan-t5-large': { provider: 'huggingface', model: 'google/flan-t5-large' },
  'google/flan-t5-xl': { provider: 'huggingface', model: 'google/flan-t5-xl' },
  'google/flan-t5-xxl': { provider: 'huggingface', model: 'google/flan-t5-xxl' },
  'EleutherAI/gpt-j-6b': { provider: 'huggingface', model: 'EleutherAI/gpt-j-6b' },
  'EleutherAI/gpt-neo-2.7B': { provider: 'huggingface', model: 'EleutherAI/gpt-neo-2.7B' },
  'EleutherAI/gpt-neox-20b': { provider: 'huggingface', model: 'EleutherAI/gpt-neox-20b' },
  
  // OpenAI Models
  'gpt-4o-mini': { provider: 'openai', model: 'gpt-4o-mini' },
  'gpt-4o': { provider: 'openai', model: 'gpt-4o' },
  'gpt-4-turbo': { provider: 'openai', model: 'gpt-4-turbo' },
  'gpt-4': { provider: 'openai', model: 'gpt-4' },
  'gpt-3.5-turbo': { provider: 'openai', model: 'gpt-3.5-turbo' },
  
  // OpenRouter Free Models
  'openchat/openchat-7b': { provider: 'openrouter', model: 'openchat/openchat-7b' },
  'mistralai/mistral-7b-instruct': { provider: 'openrouter', model: 'mistralai/mistral-7b-instruct' },
  'google/gemma-7b-it': { provider: 'openrouter', model: 'google/gemma-7b-it' },
  'nousresearch/nous-hermes-2-mixtral-8x7b-dpo': { provider: 'openrouter', model: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo' },
  'microsoft/phi-3-medium-128k-instruct': { provider: 'openrouter', model: 'microsoft/phi-3-medium-128k-instruct' },
  'meta-llama/llama-3-8b-instruct': { provider: 'openrouter', model: 'meta-llama/llama-3-8b-instruct' },
  
  // Advanced Models (using developer-provided keys)
  'nova-2-lite': { provider: 'openai', model: 'nova-2-lite' },
  'trinity-mini': { provider: 'openai', model: 'trinity-mini' },
  'olmo-3-32b-think': { provider: 'openai', model: 'olmo-3-32b-think' },
  'nemotron-nano-12b-2-vl': { provider: 'openai', model: 'nemotron-nano-12b-2-vl' },
  'gpt-oss-20b': { provider: 'openai', model: 'gpt-oss-20b' },
  'gemma-3n-2b': { provider: 'openai', model: 'gemma-3n-2b' },
  'deepseek-r1t2-chimera': { provider: 'openai', model: 'deepseek-r1t2-chimera' },
  'gemma-3n-4b': { provider: 'openai', model: 'gemma-3n-4b' },
  'deepseek-r1t-chimera': { provider: 'openai', model: 'deepseek-r1t-chimera' },
  'gemini-2.0-flash': { provider: 'openai', model: 'gemini-2.0-flash' }
};

async function fetchWithTimeout(url, opts = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function callModel(payload = {}, token = '', options = {}) {
  console.log('callModel called with:', { payload, token, options });
  
  // Use model configuration if available
  let provider = detectProvider(payload, token);
  let model = payload.model || 'meta-llama/llama-3-8b-instruct'; // Default to OpenRouter free model
  
  console.log('Initial provider and model:', { provider, model });
  
  // If a specific model is selected, use its configuration
  // Check both payload.selectedModel and payload.model to see if they match known configurations
  const selectedModel = payload.selectedModel || payload.model;
  if (selectedModel && MODEL_CONFIGS[selectedModel]) {
    const config = MODEL_CONFIGS[selectedModel];
    provider = config.provider;
    model = config.model;
    console.log('Using model config:', { provider, model, config, selectedModel });
  }
  
  console.log('Final provider and model:', { provider, model });
  
  // Log the token information for debugging
  console.log('Token info:', {
    tokenProvided: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 10) + (token.length > 10 ? '...' : '') : null
  });

  if (provider === 'openai') {
    if (!token) throw new Error('OpenAI provider selected but no API token provided. Save your token in the extension options.');
    const endpoint = payload.endpoint || 'https://api.openai.com/v1/chat/completions';
    
    // Build messages: accept either payload.messages or payload.input/prompt
    let messages = [];
    if (Array.isArray(payload.messages) && payload.messages.length) {
      messages = payload.messages;
    } else {
      const text = payload.input || payload.prompt || '';
      // Add clear instructions to the AI about what kind of response to provide
      messages = [
        { role: 'system', content: 'You are a helpful AI assistant. Provide clear, concise, and relevant responses in 2-3 sentences maximum. Do not include unnecessary information, model details, token counts, or meta-commentary. Only provide the requested information.' },
        { role: 'user', content: String(text) }
      ];
    }

    const body = {
      model,
      messages,
      temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.2,
      max_tokens: payload.max_tokens || 1024
    };

    const fetchOpts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    };
    // accept an AbortSignal via options.signal
    const signal = options && options.signal;
    if (signal) fetchOpts.signal = signal;
    const res = await fetchWithTimeout(endpoint, fetchOpts, payload.timeoutMs || 30000);

    if (!res.ok) {
      const txt = await res.text().catch(() => '<no body>');
      throw new Error(`OpenAI API error ${res.status}: ${txt}`);
    }

    const data = await res.json();

    // Try to extract a useful text output
    let text = '';
    if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
      const first = data.choices[0];
      if (first.message && typeof first.message.content === 'string') text = first.message.content;
      else if (typeof first.text === 'string') text = first.text;
      else if (Array.isArray(first.delta)) text = first.delta.map(d => d?.content || '').join('');
    } else if (data?.output && Array.isArray(data.output) && data.output[0]) {
      // OpenAI Responses API shape
      const out = data.output[0];
      if (typeof out === 'string') text = out;
      else if (out?.content && Array.isArray(out.content)) {
        // content: [{type: 'output_text', text: '...'}]
        text = out.content.map(c => c.text || '').join('\n');
      }
    }

    // Clean up the response - remove extra whitespace and trim
    text = text.trim();
    
    return { text: text || '', raw: data };
  }

  // Hugging Face fallback (use the new Router endpoint)
  if (provider === 'huggingface') {
    // HF deprecated api-inference; use the router endpoint instead
    const endpoint = `https://router.huggingface.co/models/${model}`;
    // If caller provided OpenAI-style chat messages, convert them into a single textual prompt
    let inputs = payload.input || payload.prompt || payload.text || '';
    if ((!inputs || String(inputs).trim().length === 0) && Array.isArray(payload.messages) && payload.messages.length) {
      // Join messages into a single prompt. Include role markers for clarity.
      inputs = payload.messages.map(m => (m.role ? `(${m.role}) ` : '') + (m.content || m)).join('\n\n');
    }

    // final fallback: stringify the payload to ensure something is sent
    if (!inputs || String(inputs).trim().length === 0) inputs = JSON.stringify(payload).slice(0, 2000);

    // Validate token before making request
    if (provider === 'huggingface' && (!token || token === 'YOUR_HF_TOKEN_HERE')) {
      throw new Error('Hugging Face token not configured. Please set your token in the extension options.');
    }

    try {
      const fetchOpts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ inputs })
      };
      if (options && options.signal) fetchOpts.signal = options.signal;
      const res = await fetchWithTimeout(endpoint, fetchOpts, payload.timeoutMs || 30000);
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        // If HF returns an HTML page (some proxy errors / 404 pages) make the error friendlier
        const contentType = res.headers.get('content-type') || '';
        if (res.status === 401) {
          throw new Error('Hugging Face unauthorized (401). Check your Hugging Face token in the extension options (it should start with "hf_").');
        }
        if (res.status === 404) {
          let hint = `Model not found (404) for model '${model}'.`;
          if (!token) hint += ' This may happen when no token is provided and the model is private or does not exist.';
          hint += ' Please set payload.model to a valid Hugging Face model repo (for example: "gpt2", "facebook/opt-1.3b", or a hosted inference model id) or provide a token with access.';
          // include server response body if small to aid debugging
          const bodySnippet = (typeof txt === 'string' && txt.length < 2000) ? ` Server response: ${txt}` : '';
          throw new Error(hint + bodySnippet);
        }
        // If the HF endpoint returned HTML, return a clearer message rather than raw HTML
        if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
          throw new Error(`Hugging Face API returned an HTML response (status ${res.status}). This often indicates an incorrect endpoint or access issue. Check the model name ('${model}') and your token.`);
        }
        throw new Error(`HuggingFace API error ${res.status}: ${txt}`);
      }

      const data = await res.json();
      // Hugging Face inference sometimes returns a string or an array/object
      let text = '';
      if (typeof data === 'string') text = data;
      else if (Array.isArray(data) && data.length && typeof data[0] === 'string') text = data[0];
      else if (Array.isArray(data) && data.length && data[0].generated_text) text = data[0].generated_text;
      else if (data.generated_text) text = data.generated_text;

      return { text: text || '', raw: data };
    } catch (err) {
      // If HF fails and token looks like OpenAI, automatically try OpenAI as a fallback
      console.warn('HuggingFace call failed, attempting OpenAI fallback if token indicates OpenAI', err?.message || err);
      if (typeof token === 'string' && (token.startsWith('sk-') || token.includes('openai'))) {
        // Delegate to openai path by calling recursively with provider forced
        try {
          return await (async () => {
            const openPayload = Object.assign({}, payload, { provider: 'openai' });
            return await callModel(openPayload, token);
          })();
        } catch (e2) {
          throw new Error('HuggingFace and OpenAI fallback both failed: ' + (e2?.message || e2));
        }
      }
      throw err;
    }
  }

  // GROQ provider: allow a custom endpoint by setting payload.endpoint or set provider to 'groq' in options.
  if (provider === 'groq') {
    console.log('GROQ provider called with:', { provider, model, token });
    
    // Default GROQ endpoint
    const endpoint = payload.endpoint || payload.groqEndpoint || 'https://api.groq.com/openai/v1/chat/completions';
    
    // Validate endpoint
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('http')) {
      throw new Error('Invalid GROQ endpoint: ' + endpoint);
    }

    // Build messages: accept either payload.messages or payload.input/prompt
    let messages = [];
    if (Array.isArray(payload.messages) && payload.messages.length) {
      messages = payload.messages;
    } else {
      const text = payload.input || payload.prompt || payload.text || '';
      // Add clear instructions to the AI about what kind of response to provide
      messages = [
        { role: 'system', content: 'You are a helpful AI assistant. Provide clear, concise, and relevant responses in 2-3 sentences maximum. Do not include unnecessary information, model details, token counts, or meta-commentary. Only provide the requested information.' },
        { role: 'user', content: String(text) }
      ];
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages for GROQ request');
    }

    // Check if the input is too large and needs to be chunked
    const jsonString = JSON.stringify({ model, messages, temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.2, max_tokens: payload.max_tokens || 1024 });
    const byteSize = new Blob([jsonString]).size;
    
    // If the request is too large (> 50KB), we need to handle it differently
    if (byteSize > 50000) {
      console.warn('Large request detected, attempting to reduce size');
      // Reduce the size of the messages
      messages = messages.map(msg => {
        if (msg.content && typeof msg.content === 'string' && msg.content.length > 10000) {
          return { ...msg, content: msg.content.substring(0, 10000) + '... [content truncated due to size limits]' };
        }
        return msg;
      });
    }

    if (!token) {
      console.warn('No token provided for GROQ provider');
      throw new Error('GROQ provider selected but no API token provided. Save your token in the extension options.');
    }

    try {
      const fetchOpts = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          model: model,
          messages: messages,
          temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.2,
          max_tokens: payload.max_tokens || 1024
        })
      };
      
      console.log('GROQ request:', { endpoint, fetchOpts });
      
      // Validate fetch options
      if (!fetchOpts.method || !fetchOpts.headers || !fetchOpts.body) {
        throw new Error('Invalid fetch options for GROQ request');
      }
      
      // Additional validation for fetch options
      if (typeof fetchOpts.body !== 'string') {
        throw new Error('Invalid body for GROQ request - must be a string');
      }
      
      if (!fetchOpts.headers['Content-Type'] || fetchOpts.headers['Content-Type'] !== 'application/json') {
        throw new Error('Invalid Content-Type for GROQ request');
      }
      
      if (options && options.signal) fetchOpts.signal = options.signal;
      const res = await fetchWithTimeout(endpoint, fetchOpts, payload.timeoutMs || 30000);
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        if (res.status === 401) throw new Error('GROQ endpoint unauthorized (401). Check your GROQ API token.');
        if (res.status === 413) throw new Error('GROQ endpoint error 413: Request too large. The image or text content is too big for processing.');
        throw new Error(`GROQ endpoint error ${res.status}: ${txt}`);
      }
      
      const data = await res.json();
      
      // Extract text from GROQ response
      let text = '';
      if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
        const first = data.choices[0];
        if (first.message && typeof first.message.content === 'string') {
          text = first.message.content;
        } else if (typeof first.text === 'string') {
          text = first.text;
        }
      }
      
      // Clean up the response - remove extra whitespace and trim
      text = text.trim();
      
      return { text: text || '', raw: data };
    } catch (err) {
      console.error('GROQ provider error:', err);
      throw new Error('GROQ provider call failed: ' + (err?.message || err));
    }
  }

  // OpenRouter provider
  if (provider === 'openrouter') {
    // OpenRouter requires authentication for all models (free or paid)
    // Free models are limited in rate but don't require payment
    const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Validate endpoint
    if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('http')) {
      throw new Error('Invalid OpenRouter endpoint: ' + endpoint);
    }
    
    // Build messages: accept either payload.messages or payload.input/prompt
    let messages = [];
    if (Array.isArray(payload.messages) && payload.messages.length) {
      messages = payload.messages;
    } else {
      const text = payload.input || payload.prompt || payload.text || '';
      // Add clear instructions to the AI about what kind of response to provide
      messages = [
        { role: 'system', content: 'You are a helpful AI assistant. Provide clear, concise, and relevant responses. Do not include unnecessary information or meta-commentary.' },
        { role: 'user', content: String(text) }
      ];
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages for OpenRouter request');
    }

    // Use the model from the payload or default to a free model
    const model = payload.model || 'meta-llama/llama-3-8b-instruct';
    
    try {
      // Build headers (OpenRouter requires auth header with special key or API key)
      const headers = { 
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://www.yoursite.com', // Required by OpenRouter
        'X-Title': 'AI Assistant Extension' // Required by OpenRouter
      };
      
      // OpenRouter requires an API key, but also accepts requests without one for free models
      // with very limited rate limits. For production, users should provide a key.
      // Try with the token if provided, otherwise make unauthenticated request (free tier)
      if (token && token !== 'YOUR_API_TOKEN_HERE' && token.length > 5) {
        headers.Authorization = `Bearer ${token}`;
      }
      // If no valid token, OpenRouter will still accept the request but with free tier limits
      
      // DEBUG: Log exactly what we're sending
      console.log('DEBUG - Building OpenRouter request with:', {
        model,
        hasToken: !!token,
        headers: Object.keys(headers),
        messageCount: messages.length,
        firstMessage: messages[0]?.content?.substring(0, 100) + '...'
      });
      
      const fetchOpts = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          model: model,
          messages: messages,
          temperature: typeof payload.temperature === 'number' ? payload.temperature : 0.2,
          max_tokens: payload.max_tokens || 1024
        })
      };
      
      // Validate fetch options
      if (!fetchOpts.method || !fetchOpts.headers || !fetchOpts.body) {
        throw new Error('Invalid fetch options for OpenRouter request');
      }
      
      // Additional validation for fetch options
      if (typeof fetchOpts.body !== 'string') {
        throw new Error('Invalid body for OpenRouter request - must be a string');
      }
      
      if (!fetchOpts.headers['Content-Type'] || fetchOpts.headers['Content-Type'] !== 'application/json') {
        throw new Error('Invalid Content-Type for OpenRouter request');
      }
      
      // Log the exact request being made
      console.log('FINAL OpenRouter request:', JSON.stringify(fetchOpts, null, 2));
      
      if (options && options.signal) fetchOpts.signal = options.signal;
      const res = await fetchWithTimeout(endpoint, fetchOpts, payload.timeoutMs || 30000);
      
      console.log('OpenRouter response status:', res.status);
      
      if (!res.ok) {
        const txt = await res.text().catch(() => '<no body>');
        console.log('OpenRouter error response body:', txt);
        
        // If we got 401, surface an explicit message about auth
        if (res.status === 401) {
          throw new Error(`OpenRouter endpoint unauthorized (401). Check your OpenRouter API token.`);
        }

        // If 404 and we sent an Authorization header, retry once without it.
        // Some OpenRouter API keys are scoped and may not have access to public/free models —
        // retrying without Authorization lets us use the public endpoint if available.
        if (res.status === 404 && headers && headers.Authorization) {
          console.warn('OpenRouter returned 404 while using Authorization header; retrying without Authorization to check public model availability');
          try {
            // Clone fetchOpts but remove Authorization header
            const retryHeaders = { ...headers };
            delete retryHeaders.Authorization;
            const retryFetchOpts = { ...fetchOpts, headers: retryHeaders };
            if (options && options.signal) retryFetchOpts.signal = options.signal;
            const retryRes = await fetchWithTimeout(endpoint, retryFetchOpts, payload.timeoutMs || 30000);
            if (!retryRes.ok) {
              const retryTxt = await retryRes.text().catch(() => '<no body>');
              if (retryRes.status === 401) throw new Error(`OpenRouter endpoint unauthorized (401). Check your OpenRouter API token.`);
              if (retryRes.status === 413) throw new Error('OpenRouter endpoint error 413: Request too large. The image or text content is too big for processing.');
              throw new Error(`OpenRouter endpoint error ${retryRes.status}: ${retryTxt}`);
            }
            const retryData = await retryRes.json();
            // Extract text from retryData
            let retryText = '';
            if (retryData?.choices && Array.isArray(retryData.choices) && retryData.choices.length) {
              const first = retryData.choices[0];
              if (first.message && typeof first.message.content === 'string') retryText = first.message.content;
              else if (typeof first.text === 'string') retryText = first.text;
            }
            retryText = retryText.trim();
            return { text: retryText || '', raw: retryData };
          } catch (retryErr) {
            console.warn('Retry without Authorization also failed:', retryErr?.message || retryErr);
            // fall through to throw original 404 below
          }
        }

        if (res.status === 413) throw new Error('OpenRouter endpoint error 413: Request too large. The image or text content is too big for processing.');
        throw new Error(`OpenRouter endpoint error ${res.status}: ${txt}`);
      }
      
      const data = await res.json();
      console.log('OpenRouter response data:', data);
      
      // Extract text from OpenRouter response
      let text = '';
      if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
        const first = data.choices[0];
        if (first.message && typeof first.message.content === 'string') {
          text = first.message.content;
        } else if (typeof first.text === 'string') {
          text = first.text;
        }
      }
      
      // Clean up the response - remove extra whitespace and trim
      text = text.trim();
      
      return { text: text || '', raw: data };
    } catch (err) {
      console.error('OpenRouter provider error:', err);
      throw new Error('OpenRouter provider call failed: ' + (err?.message || err));
    }
  }

  throw new Error('Unsupported provider: ' + provider);
}
