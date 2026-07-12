const OpenAI = require('openai');

/**
 * Auto-selects Groq or OpenAI based on available env vars.
 * Groq is fully OpenAI SDK-compatible — same interface, different baseURL.
 */

const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_');
const hasOpenAI = process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-your');

let client;
let modelName;

if (hasGroq) {
  client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  modelName = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  console.log(`🤖 AI Provider: Groq (${modelName})`);
} else if (hasOpenAI) {
  client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  modelName = process.env.OPENAI_MODEL || 'gpt-4o';
  console.log(`🤖 AI Provider: OpenAI (${modelName})`);
} else {
  console.warn('⚠️  No AI key configured. AI features will return an error.');
  client = null;
  modelName = null;
}

module.exports = { client, modelName };
