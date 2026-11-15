import { NextResponse } from 'next/server';
import { testSanityConnection, getSanityConfig } from '@/lib/sanity';

export async function GET() {
  const config = getSanityConfig();
  const test = await testSanityConnection();

  return NextResponse.json({
    config,
    ...test,
  });
}
