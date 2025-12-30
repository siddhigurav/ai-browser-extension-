// Debug script for API client
console.log('Starting API client debug...');

// Import the API client
import { callModel } from './api/apiClient.js';

async function debugCallModel() {
  try {
    console.log('Testing callModel with free OpenRouter model...');
    
    const payload = {
      input: "Hello, world!",
      model: "meta-llama/llama-3-8b-instruct",
      provider: "openrouter"
    };
    
    const response = await callModel(payload, ''); // Empty token for free model
    console.log('Success! Response:', response);
    
    if (response && response.text) {
      console.log('Text response:', response.text);
    }
  } catch (error) {
    console.error('Error in callModel:', error);
    console.error('Error stack:', error.stack);
  }
}

// Run the debug test
debugCallModel();