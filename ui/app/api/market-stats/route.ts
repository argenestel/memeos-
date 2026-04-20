import { fetchTokenList } from '@/lib/fourmeme';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Fetch HOT tokens for trending
    const hotTokens = await fetchTokenList(1, 30, 'HOT');
    // Fetch NEW tokens to find recent rugged
    const newTokens = await fetchTokenList(1, 50, 'NEW');

    // 1. Trending (top 5 by highest increase in the HOT list)
    const trending = [...hotTokens]
      .sort((a, b) => parseFloat(b.increase) - parseFloat(a.increase))
      .slice(0, 5)
      .map(t => ({
        t: t.shortName,
        ch: `+${(parseFloat(t.increase) * 100).toFixed(0)}%`,
        mc: `$${parseFloat(t.cap).toFixed(0)}K`,
        up: true,
      }));

    // 2. Rugged (worst performers in the NEW list)
    const rugged = [...newTokens]
      .filter(t => parseFloat(t.increase) < 0)
      .sort((a, b) => parseFloat(a.increase) - parseFloat(b.increase))
      .slice(0, 3)
      .map(t => ({
        t: t.shortName,
        ch: `${(parseFloat(t.increase) * 100).toFixed(0)}%`,
        lost: `$${parseFloat(t.cap).toFixed(0)}K`, // Using MC as proxy for lost
      }));

    // 3. Fear & Greed Index
    // Let's use the average increase of top 20 HOT + top 20 NEW to calculate a score 0-100
    const allTokens = [...hotTokens, ...newTokens];
    const avgIncrease = allTokens.reduce((acc, curr) => acc + parseFloat(curr.increase), 0) / (allTokens.length || 1);
    
    // Scale avgIncrease to a 0-100 index (arbitrary formula for visual feel)
    // Assuming 0.5 (50%) average increase is a 100 (max greed)
    // Assuming 0 (0%) average increase is a 50 (neutral)
    // Assuming -0.5 (-50%) average increase is a 0 (max fear)
    let fearGreedValue = 50 + (avgIncrease * 100);
    fearGreedValue = Math.max(0, Math.min(100, Math.round(fearGreedValue)));

    return NextResponse.json({
      trending,
      rugged,
      fearValue: fearGreedValue
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
