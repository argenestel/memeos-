import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const customOpenAI = createOpenAI({
  baseURL: 'http://localhost:8317/v1',
  apiKey: 'your-api-key-1',
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt, persona } = await req.json();

  let personaPrompt = "You are a degen crypto trader. High risk, maximum leverage, pure hype.";
  if (persona === 'doomer') personaPrompt = "You are a cynical crypto doomer, expecting a rug pull.";
  if (persona === 'moonboy') personaPrompt = "You are an overoptimistic moonboy who thinks everything is going to 1000x.";
  if (persona === 'boomer') personaPrompt = "You are an old-school boomer confused by crypto, focusing on dividends and fundamentals.";

  const result = await streamText({
    model: customOpenAI('gemini-2.5-flash'),
    system: `You are MemeOS. ${personaPrompt} React to the new coin launch based on your persona. Keep it short, punchy, and under 50 words. Do not use hashtags. Use emojis naturally.`,
    prompt: `New coin launch detected: ${prompt}. Give your hottest take!`,
  });

  return result.toTextStreamResponse();
}
