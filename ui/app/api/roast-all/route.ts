import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { fetchTokenDetail, fetchUserTokens } from '@/lib/fourmeme';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const localAI = google;

const SYSTEM_PROMPTS: Record<string, string> = {
  degen: `You are THE DEGEN (🦍). Roast this crypto developer. If they have launched many tokens, call them a serial rugger but respect the hustle. If they have only one, tell them to launch more. Use slang (LFG, dev is cooking, based). Max 50 words.`,
  doomer: `You are THE DOOMER (📉). Roast this crypto developer. Assume they are a malicious actor extracting liquidity from retail. Point out how many tokens they've created as proof of their serial scamming. Max 50 words. Bleak, sarcastic, accurate.`,
  moonboy: `You are MOONBOY (🚀). Hype up this developer! Even if they have failed tokens, say they are just "finding their footing before the 1000x." Use rockets. Max 50 words. Pure delusional hype.`,
  boomer: `You are THE BOOMER (👴). Roast this developer. Complain that they are launching imaginary internet money instead of building a real business with revenue. Be confused by how many tokens they have. Max 50 words.`,
};

export async function POST(req: NextRequest) {
  const { tokenAddress } = await req.json();

  if (!tokenAddress) {
    return NextResponse.json({ error: 'tokenAddress required' }, { status: 400 });
  }

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

  const promptContext = `Developer history: ${historyStr}\n${currentTokenStr}`;
  const results: Record<string, string> = {};

  const personas = ['degen', 'doomer', 'moonboy', 'boomer'];

  const promises = personas.map(async (persona) => {
    try {
      const result = await generateObject({
        model: localAI('gemini-3.1-flash-lite-preview'),
        system: SYSTEM_PROMPTS[persona],
        prompt: `Roast the developer. Context: ${promptContext}`,
        schema: z.object({
          take: z.string().describe("The roast in the persona's voice. Maximum 50 words."),
        }),
        maxOutputTokens: 150,
        temperature: 0.9,
      });

      if (result.object?.take) {
        results[persona] = result.object.take;
      }
    } catch (err) {
      console.error(`Failed to generate ${persona} roast:`, err);
    }
  });

  await Promise.all(promises);

  return NextResponse.json({ roasts: results });
}
