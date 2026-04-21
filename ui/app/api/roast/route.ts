import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';
import { fetchTokenDetail, fetchUserTokens } from '@/lib/fourmeme';

const localAI = google;

export const maxDuration = 30;

const SYSTEM_PROMPTS: Record<string, string> = {
  degen: `You are THE DEGEN (🦍). Roast this crypto developer. If they have launched many tokens, call them a serial rugger but respect the hustle. If they have only one, tell them to launch more. Use slang (LFG, dev is cooking, based). Max 50 words.`,
  doomer: `You are THE DOOMER (📉). Roast this crypto developer. Assume they are a malicious actor extracting liquidity from retail. Point out how many tokens they've created as proof of their serial scamming. Max 50 words. Bleak, sarcastic, accurate.`,
  moonboy: `You are MOONBOY (🚀). Hype up this developer! Even if they have failed tokens, say they are just "finding their footing before the 1000x." Use rockets. Max 50 words. Pure delusional hype.`,
  boomer: `You are THE BOOMER (👴). Roast this developer. Complain that they are launching imaginary internet money instead of building a real business with revenue. Be confused by how many tokens they have. Max 50 words.`,
};

export async function POST(req: Request) {
  const { tokenAddress, persona } = await req.json();

  let historyStr = "No history found.";
  let currentTokenStr = "";

  try {
    const detail = await fetchTokenDetail(tokenAddress);
    currentTokenStr = `Currently launching: ${detail.name} ($${detail.shortName}).`;
    
    if (detail.userId) {
      const userTokens = await fetchUserTokens(detail.userId);
      const pastTokens = userTokens.filter((t: any) => t.tokenAddress !== tokenAddress);
      
      if (pastTokens.length > 0) {
        historyStr = `Developer has previously launched ${pastTokens.length} tokens: ` + 
          pastTokens.map((t: any) => `$${t.shortName}`).slice(0, 5).join(', ') + 
          (pastTokens.length > 5 ? '...' : '');
      } else {
        historyStr = "This is their first token launch on this platform.";
      }
    }
  } catch (e) {
    console.error("Failed to fetch dev history for roast:", e);
  }

  const systemPrompt = SYSTEM_PROMPTS[persona as string] ?? SYSTEM_PROMPTS.degen;
  const promptContext = `Developer history: ${historyStr}\n${currentTokenStr}`;

  const result = await streamObject({
    model: localAI('gemini-3.1-flash-lite-preview'),
    system: systemPrompt,
    prompt: `Roast the developer. Context: ${promptContext}`,
    schema: z.object({
      take: z.string().describe("The roast in the persona's voice. Maximum 50 words."),
    }),
    maxOutputTokens: 150,
    temperature: 0.9,
  });

  return result.toTextStreamResponse();
}