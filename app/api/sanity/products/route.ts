import { NextRequest, NextResponse } from 'next/server';
import {
  fetchSanityProducts,
  fetchSanityCategories,
  writeProductToSanity,
  deleteProductFromSanity,
  isSanityConfigured,
  getSanityConfig,
} from '@/lib/sanity';
import { Product } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET: Fetch products & custom categories from Sanity
export async function GET() {
  if (!isSanityConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        products: [],
        categories: [],
        message: 'NEXT_PUBLIC_SANITY_PROJECT_ID not configured.',
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }

  try {
    const [products, categories] = await Promise.all([
      fetchSanityProducts(),
      fetchSanityCategories(),
    ]);
    return NextResponse.json(
      {
        configured: true,
        products,
        categories,
        count: products.length,
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products from Sanity' },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}

// POST: Add new product to Sanity
export async function POST(req: NextRequest) {
  const config = getSanityConfig();
  if (!config.hasToken) {
    return NextResponse.json(
      {
        error:
          'SANITY_API_TOKEN is required to add or delete products in Sanity. Please set SANITY_API_TOKEN in your environment secrets.',
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const product: Product = body.product;
    if (!product || !product.id || !product.name) {
      return NextResponse.json(
        { error: 'Product name and ID are required.' },
        { status: 400 }
      );
    }

    const result = await writeProductToSanity(product);
    return NextResponse.json({
      success: true,
      result,
      message: `Product "${product.name}" successfully created in Sanity.`,
    });
  } catch (error: any) {
    console.error('Sanity POST product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product in Sanity.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product from Sanity
export async function DELETE(req: NextRequest) {
  const config = getSanityConfig();
  if (!config.hasToken) {
    return NextResponse.json(
      {
        error:
          'SANITY_API_TOKEN is required to delete products in Sanity. Please set SANITY_API_TOKEN in your environment secrets.',
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Product id parameter is required.' },
        { status: 400 }
      );
    }

    await deleteProductFromSanity(id);
    return NextResponse.json({
      success: true,
      message: `Product "${id}" deleted from Sanity.`,
    });
  } catch (error: any) {
    console.error('Sanity DELETE product error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete product from Sanity.' },
      { status: 500 }
    );
  }
}
