import { NextRequest, NextResponse } from 'next/server';
import {
  fetchSanityImageAssets,
  getSanityConfig,
  isSanityConfigured,
  uploadImageBufferToSanity,
} from '@/lib/sanity';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = getSanityConfig();
  if (!isSanityConfigured()) {
    return NextResponse.json({
      configured: false,
      hasToken: config.hasToken,
      projectId: '',
      dataset: config.dataset,
      assets: [],
      message: 'NEXT_PUBLIC_SANITY_PROJECT_ID is not configured yet.',
    });
  }

  try {
    const assets = await fetchSanityImageAssets(80);
    return NextResponse.json({
      configured: true,
      hasToken: config.hasToken,
      projectId: config.projectId,
      dataset: config.dataset,
      assets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load Sanity image assets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const config = getSanityConfig();
  if (!isSanityConfigured() || !config.hasToken) {
    return NextResponse.json(
      {
        configured: isSanityConfigured(),
        hasToken: config.hasToken,
        error:
          'NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN are required to upload image assets directly to Sanity CDN.',
      },
      { status: 401 }
    );
  }

  try {
    const contentTypeHeader = req.headers.get('content-type') || '';

    if (contentTypeHeader.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing image file.' }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || 'image/webp';
      const filename = file.name || `kvist-asset-${Date.now()}.webp`;
      const asset = await uploadImageBufferToSanity(buffer, filename, mimeType);
      return NextResponse.json({ success: true, asset });
    }

    const body = await req.json();
    const dataUrl: string | undefined = body?.dataUrl;
    const filename: string = body?.filename || `kvist-asset-${Date.now()}.webp`;
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Expected multipart file or valid image dataUrl.' },
        { status: 400 }
      );
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid base64 image payload.' }, { status: 400 });
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const asset = await uploadImageBufferToSanity(buffer, filename, mimeType);
    return NextResponse.json({ success: true, asset });
  } catch (error: any) {
    console.error('Sanity asset upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image asset to Sanity.' },
      { status: 500 }
    );
  }
}
