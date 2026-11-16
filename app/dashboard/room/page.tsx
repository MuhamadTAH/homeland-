'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { useShowroom } from '@/components/providers';
import { RoomHotspotEditor } from '@/components/room-hotspot-editor';
import { getDashCopy } from '@/lib/dashboard-i18n';

export default function DashboardRoomHotspotsPage() {
  const { locale, dir } = useShowroom();
  const d = getDashCopy(locale);
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-line bg-card p-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12px] font-medium text-ink-soft">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 hover:text-ink"
            >
              <BackArrow className="h-3.5 w-3.5" />
              <span>{d.backToOverview}</span>
            </Link>
            <span aria-hidden="true">·</span>
            <span>{d.navRoom}</span>
          </div>
          <h1 className="display mt-1.5 text-balance text-[clamp(22px,2.8vw,32px)] font-semibold tracking-[-0.03em] text-ink">
            {d.roomPageTitle}
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft">{d.roomPageSubtitle}</p>
        </div>

        <Link
          href="/#room-vignette"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[12px] font-medium text-card whitespace-nowrap shrink-0 transition-colors hover:bg-accent"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{d.previewOnLanding}</span>
        </Link>
      </div>

      <RoomHotspotEditor />
    </div>
  );
}
