const AIProvider = require('./AIProvider');
const config = require('../../config');

/**
 * GeminiProvider — implements AIProvider using Google Gemini API.
 * Free tier: https://aistudio.google.com/app/apikey
 *
 * Includes:
 * - Automatic retry with exponential backoff on 503
 * - Fallback to alternative models if primary is overloaded
 * - Markdown fence stripping (Gemini wraps JSON in ```json blocks)
 */
class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this._client = null;
  }

  // Ordered fallback list — try primary first, then alternatives
  get _modelFallbacks() {
    const primary = config.gemini.model;
    const alternatives = [
      'gemini-3.7-flash',
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
    ].filter(m => m !== primary);
    return [primary, ...alternatives];
  }

  _getClient() {
    if (!this._client) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      if (!config.gemini.apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }
      this._client = new GoogleGenerativeAI(config.gemini.apiKey);
    }
    return this._client;
  }

  async complete(systemPrompt, userPrompt) {
    const genAI = this._getClient();
    let lastError;

    for (const modelName of this._modelFallbacks) {
      try {
        const result = await this._callWithRetry(genAI, modelName, systemPrompt, userPrompt);
        return result;
      } catch (err) {
        const is503 = err.message && (err.message.includes('503') || err.message.includes('overloaded') || err.message.includes('high demand'));
        const is404 = err.message && err.message.includes('404');

        if (is503 || is404) {
          console.warn(`[GeminiProvider] Model ${modelName} unavailable (${is503 ? '503' : '404'}), trying next...`);
          lastError = err;
          continue;
        }
        // Non-retriable error — throw immediately
        throw err;
      }
    }

    throw new Error(`All Gemini models are currently unavailable. Last error: ${lastError?.message}`);
  }

  async _callWithRetry(genAI, modelName, systemPrompt, userPrompt, maxRetries = 2) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = attempt * 3000; // 3s, 6s backoff
        console.log(`[GeminiProvider] Retry ${attempt}/${maxRetries} for ${modelName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          generationConfig: { temperature: 0.3 },
        });

        const result = await model.generateContent(userPrompt);
        const text = result.response.text().trim();

        // Strip markdown code fences that Gemini sometimes wraps JSON in
        const cleaned = text
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/, '')
          .trim();

        return cleaned;
      } catch (err) {
        const isRetriable = err.message && (
          err.message.includes('503') ||
          err.message.includes('fetch failed') ||
          err.message.includes('ECONNRESET')
        );

        if (isRetriable && attempt < maxRetries) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  }
}

module.exports = GeminiProvider;
