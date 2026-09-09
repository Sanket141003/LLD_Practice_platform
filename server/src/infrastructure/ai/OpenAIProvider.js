const AIProvider = require('./AIProvider');
const config = require('../../config');

class OpenAIProvider extends AIProvider {
  constructor() {
    super();
    // Lazy-load OpenAI to avoid crashing if key isn't set in demo mode
    this._client = null;
  }

  _getClient() {
    if (!this._client) {
      const { OpenAI } = require('openai');
      if (!config.openai.apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      this._client = new OpenAI({ apiKey: config.openai.apiKey });
    }
    return this._client;
  }

  async complete(systemPrompt, userPrompt) {
    const client = this._getClient();
    const response = await client.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temp for more consistent structured output
      response_format: { type: 'json_object' },
    });
    return response.choices[0].message.content;
  }
}

module.exports = OpenAIProvider;
