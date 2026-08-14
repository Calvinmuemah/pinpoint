const env = require('../config/env');

let ai = null;

try {
  if (env.GEMINI_API_KEY) {
    const { GoogleGenAI } = require('@google/genai');
    ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
} catch (err) {
  console.warn('Google GenAI package initialization warning:', err.message);
}

/**
 * Analyzes raw text for travel intent using Gemini
 */
const analyzeTravelIntent = async (rawText) => {
  const prompt = `You are PinPoint AI, an intelligence service that extracts travel intent, destination, budget, travel type, and calculates lead scores from text.
Analyze the following text and return ONLY valid JSON with this exact schema:
{
  "isTravelIntent": boolean,
  "destination": string or null,
  "travelPeriod": string or null,
  "travelType": string or null,
  "budget": number or null,
  "intentScore": integer between 0 and 100,
  "scoreCategory": "Hot" or "Warm" or "Cool",
  "confidence": float between 0.0 and 1.0,
  "reasoning": string,
  "extractedEntities": {
    "destination": string or null,
    "timeframe": string or null,
    "travelType": string or null,
    "budget": number or null
  }
}

Input text:
"${rawText}"`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      return JSON.parse(text);
    } catch (err) {
      console.error('Gemini API request failed, falling back to intelligent parser:', err.message);
    }
  }

  // Intelligent fallback parser for local development / testing without API keys
  const lower = rawText.toLowerCase();
  const isTravelIntent = ['travel', 'trip', 'vacation', 'visit', 'safari', 'resort', 'hotel', 'flight', 'mombasa', 'nairobi', 'kenya'].some(w => lower.includes(w));

  let destination = null;
  if (lower.includes('mombasa')) destination = 'Mombasa';
  else if (lower.includes('nairobi')) destination = 'Nairobi';
  else if (lower.includes('kenya')) destination = 'Kenya';
  else if (lower.includes('zanzibar')) destination = 'Zanzibar';

  let budget = null;
  const match = rawText.match(/\$?\b\d{3,5}\b/);
  if (match) budget = parseFloat(match[0].replace('$', ''));

  const intentScore = isTravelIntent ? (destination ? 87 : 65) : 30;
  const scoreCategory = intentScore >= 80 ? 'Hot' : intentScore >= 50 ? 'Warm' : 'Cool';

  return {
    isTravelIntent,
    destination,
    travelPeriod: lower.includes('next month') ? 'next month' : 'upcoming',
    travelType: lower.includes('safari') ? 'Safari' : 'Leisure',
    budget,
    intentScore,
    scoreCategory,
    confidence: isTravelIntent ? 0.92 : 0.35,
    reasoning: isTravelIntent
      ? `Text contains strong travel indicators pointing to ${destination || 'general travel'}.`
      : 'Low intent signals detected in input content.',
    extractedEntities: {
      destination,
      timeframe: lower.includes('next month') ? 'next month' : null,
      travelType: lower.includes('safari') ? 'Safari' : 'Leisure',
      budget,
    },
  };
};

module.exports = {
  analyzeTravelIntent,
};
