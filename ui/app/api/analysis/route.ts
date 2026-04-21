import sql from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  const persona = req.nextUrl.searchParams.get('persona');

  if (!address || !persona) {
    return NextResponse.json(
      { error: 'address and persona are required' },
      { status: 400 },
    );
  }

  try {
    const rows = await sql`
      SELECT take FROM token_analyses
      WHERE token_address = ${address} AND persona = ${persona}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ cached: false, take: null });
    }

    return NextResponse.json({ cached: true, take: rows[0].take });
  } catch (err) {
    console.error('Analysis fetch error:', err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}