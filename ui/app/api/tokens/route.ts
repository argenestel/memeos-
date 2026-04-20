// app/api/tokens/route.ts
// Proxies four.meme search to avoid CORS from the browser
import { fetchTokenList, type SearchType } from '@/lib/fourmeme';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const size = parseInt(searchParams.get('size') ?? '20', 10);
  const type = (searchParams.get('type') ?? 'NEW') as SearchType;

  try {
    const tokens = await fetchTokenList(page, size, type);
    return NextResponse.json({ tokens });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
