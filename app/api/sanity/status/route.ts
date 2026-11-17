import { NextResponse } from 'next/server';
import { testSanityConnection, getSanityConfig } from '@/lib/sanity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const config = getSanityConfig();
  const test = await testSanityConnection();

  return NextResponse.json(
    {
      config,
      ...test,
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}
