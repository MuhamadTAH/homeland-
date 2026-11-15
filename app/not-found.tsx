'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BTN_PRIMARY, imgPath } from '@/lib/catalog';
import { StoreShell } from '@/components/store-shell';

export default function NotFound() {
  return (
    <StoreShell>
      <section className="grid min-h-[86vh] place-items-center px-6 pt-24">
        <div className="text-center">
          <motion.img
            src={imgPath('stool.webp')}
            alt=""
            referrerPolicy="no-referrer"
            className="mx-auto h-48 w-auto"
            initial={{ rotate: 0, y: -40, opacity: 0 }}
            animate={{
              rotate: [0, 0, -18, -12],
              y: [-40, 0, 0, 6],
              opacity: 1,
            }}
            transition={{ duration: 1.4, times: [0, 0.4, 0.75, 1], ease: 'easeOut' }}
          />
          <h1 className="display mt-6 text-6xl">This page wobbled off.</h1>
          <p className="mt-3 text-ink-soft">
            The link may be old, or the piece has moved.
          </p>
          <Link href="/" className={`${BTN_PRIMARY} mt-8`}>
            Back home
          </Link>
        </div>
      </section>
    </StoreShell>
  );
}
