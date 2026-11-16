import { NextResponse } from 'next/server';
import { STARTER_PRODUCTS } from '@/lib/catalog';
import { writeProductToSanity, getSanityConfig } from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export async function POST() {
  const config = getSanityConfig();
  if (!config.hasToken) {
    return NextResponse.json(
      {
        error:
          'SANITY_API_TOKEN is required to export products to Sanity. Please set SANITY_API_TOKEN in your environment secrets.',
      },
      { status: 401 }
    );
  }

  try {
    let count = 0;
    for (const p of STARTER_PRODUCTS) {
      await writeProductToSanity(p);
      count++;
    }

    return NextResponse.json({
      success: true,
      count,
      message: `Successfully seeded ${count} architectural pieces into your Sanity dataset.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to seed catalog to Sanity' },
      { status: 500 }
    );
  }
}
