// app/api/token/route.ts
// Proxies four.meme token detail to avoid CORS
import { fetchTokenDetail } from '@/lib/fourmeme';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  try {
    const detail = await fetchTokenDetail(address);
    return NextResponse.json({ detail });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
