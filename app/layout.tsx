import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers';

export const metadata: Metadata = {
  title: 'KVIST — Calm objects for slow homes',
  description:
    'Solid oak, bouclé and hand-thrown clay. KVIST makes furniture, lighting and textiles for slow homes, dispatched in 48 hours.',
  openGraph: {
    title: 'KVIST — Calm objects for slow homes',
    description: 'Furniture, lighting and textiles made to be lived with.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KVIST — Calm objects for slow homes',
    description: 'Furniture, lighting and textiles made to be lived with.',
  },
};

export const viewport: Viewport = {
  themeColor: '#f2efe9',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Geist:wght@400..600&family=Geist+Mono:wght@400..500&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Readex+Pro:wght@400;500;600;700&family=Vazirmatn:wght@400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
