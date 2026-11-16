import { NextRequest, NextResponse } from 'next/server';
import {
  fetchSanityRoomScene,
  writeRoomSceneToSanity,
  isSanityConfigured,
  getSanityConfig,
} from '@/lib/sanity';
import { RoomScene } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSanityConfigured()) {
    return NextResponse.json({
      configured: false,
      roomScene: null,
    });
  }

  try {
    const roomScene = await fetchSanityRoomScene();
    return NextResponse.json({
      configured: true,
      roomScene,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch room scene from Sanity' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const config = getSanityConfig();
  if (!config.hasToken) {
    return NextResponse.json(
      {
        error: 'SANITY_API_TOKEN is required to save room scenes in Sanity.',
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const roomScene: RoomScene = body.roomScene;
    if (!roomScene || !roomScene.image) {
      return NextResponse.json(
        { error: 'Room scene image and hotspots are required.' },
        { status: 400 }
      );
    }

    const result = await writeRoomSceneToSanity(roomScene);
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Sanity POST roomScene error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save room scene in Sanity.' },
      { status: 500 }
    );
  }
}
