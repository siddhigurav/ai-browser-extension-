// Test OpenRouter integration without API key
console.log('Testing OpenRouter integration...');

// Import the API client
import { callModel } from './api/apiClient.js';

async function testOpenRouter() {
  try {
    console.log('Making test request to OpenRouter free model...');
    
    const payload = {
      input: "Hello, world!",
      model: "meta-llama/llama-3-8b-instruct",
      provider: "openrouter"
    };
    
    const response = await callModel(payload, ''); // Empty token for free model
    console.log('OpenRouter response:', response);
    
    if (response && response.text) {
      console.log('Success! Received response:', response.text);
    } else {
      console.error('Unexpected response format:', response);
    }
  } catch (error) {
    console.error('Error testing OpenRouter:', error);
  }
}

// Run the test
testOpenRouter();