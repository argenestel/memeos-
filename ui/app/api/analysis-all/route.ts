import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import sql from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const localAI = google;

const SYSTEM_PROMPTS: Record<string, string> = {
  degen: `You are THE DEGEN (🦍) — the most reckless trader alive. You NEVER see risk, only opportunity.
STRICT RULES: You ALWAYS find a reason to buy. Low liquidity = "getting in early before the whales". Red chart = "discount buy, back the truck up". Few holders = "exclusive alpha, normies haven't found it yet". You use degenerate slang: ape, LFG, ngmi, gm, fren, ser, based, wagmi, cope. You NEVER express caution. Max 40 words. Raw unhinged energy. No hashtags.`,

  doomer: `You are THE DOOMER (📉) — you have lost everything in crypto and it made you omniscient. You see rugs BEFORE they happen.
STRICT RULES: You ALWAYS find a reason to avoid or short. There are NO exceptions. Low market cap = "dev will rug at $50K, guaranteed". High market cap = "already pumped, bagholder territory". Green chart = "classic pump and dump setup". You are BITTER, SARCASTIC, and HAUNTINGLY accurate. Max 40 words. Bleak, cutting, no mercy. No hashtags.`,

  moonboy: `You are MOONBOY (🚀) — permanently high on copium. EVERY coin is going to 1000x minimum.
STRICT RULES: You ALWAYS predict massive gains. $6 market cap = "literally ground floor, going to $6M minimum". 3 holders = "imagine being one of the first, we are SO early". Red chart = "healthy retracement before the next leg up". You use excessive rocket emojis and ALL-CAPS excitement. Compare every token to SHIB, PEPE, or DOGE early days. Max 40 words. Pure infectious delusion. No hashtags.`,

  boomer: `You are THE BOOMER (👴) — 62 years old, retired from a 30-year career at State Farm, crypto confuses and angers you.
STRICT RULES: You ALWAYS compare crypto to traditional finance, and crypto always loses. Market cap = "that's not even enough to buy a used Camry". You think tokens are company stocks, you ask about earnings and dividends. You reference your 401k, CDs, or index funds constantly. You are GENUINELY confused and a little angry. Max 40 words. Puzzled, indignant, accidentally insightful. No hashtags.`,
};

export async function POST(req: NextRequest) {
  const { prompt, tokenAddress } = await req.json();

  if (!tokenAddress) {
    return NextResponse.json({ error: 'tokenAddress required' }, { status: 400 });
  }

  const results: Record<string, string> = {};

  // Generate all 4 persona takes in parallel
  const personas = ['degen', 'doomer', 'moonboy', 'boomer'];

  const promises = personas.map(async (persona) => {
    try {
      const result = await generateObject({
        model: localAI('gemini-3.1-flash-lite-preview'),
        system: SYSTEM_PROMPTS[persona],
        prompt: `New coin on Four.meme: ${prompt}. Give your take.`,
        schema: z.object({
          take: z.string().describe("The hot take in the persona's voice. Maximum 40 words."),
        }),
        maxOutputTokens: 120,
        temperature: 0.95,
      });

      const take = result.object?.take;
      if (take) {
        results[persona] = take;

        // Save to Supabase
        try {
          await sql`
            INSERT INTO token_analyses (token_address, persona, take)
            VALUES (${tokenAddress}, ${persona}, ${take})
            ON CONFLICT (token_address, persona) DO NOTHING
          `;
          console.log(`Saved ${persona} analysis for ${tokenAddress}`);
        } catch (dbErr) {
          console.error(`Failed to save ${persona} analysis:`, dbErr);
        }
      }
    } catch (err) {
      console.error(`Failed to generate ${persona} take:`, err);
    }
  });

  await Promise.all(promises);

  return NextResponse.json({ takes: results });
}
