'use client';

import React, { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ArrowUpLeft, ArrowUpRight, ExternalLink, MapPin } from 'lucide-react';
import { Locale } from '@/lib/i18n';

// Tier 1: Global Maps JavaScript API & Map tile quota tap (Demo Key protection)
if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;
  if (!win.__gmpQuotaTapRegistered) {
    win.__gmpQuotaTapRegistered = true;
    win.gm_authFailure = () => {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    };
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      origError.apply(console, args);
      const msg = args.map((a) => String(a)).join(' ');
      if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    };
  }
}

export function MapsQuotaBanner() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  if (!quotaExceeded) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit{' '}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-amber-950 hover:text-amber-800"
        >
          maps developer site
        </a>{' '}
        for instructions to update your account.
      </span>
    </div>
  );
}

interface ResolvedShowroomPlace {
  lat: number;
  lng: number;
  formattedAddress?: string;
  googleMapsURI: string;
}

const resolvedPlaceCache: Record<string, ResolvedShowroomPlace> = {};

function ShowroomMapCanvas({
  locationId,
  searchQuery,
  cityLabel,
  addressLabel,
  openMapsLabel,
  dir,
}: {
  locationId: string;
  searchQuery: string;
  cityLabel: string;
  addressLabel: string;
  openMapsLabel: string;
  dir: 'ltr' | 'rtl';
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [resolvedById, setResolvedById] = useState<Record<string, ResolvedShowroomPlace>>(
    () => ({ ...resolvedPlaceCache })
  );

  const resolved = resolvedById[locationId] ?? resolvedPlaceCache[locationId] ?? null;

  const fallbackMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    searchQuery
  )}`;

  useEffect(() => {
    const cached = resolvedPlaceCache[locationId];
    if (cached) {
      if (map) {
        map.panTo({ lat: cached.lat, lng: cached.lng });
        map.setZoom(15);
      }
      return;
    }

    if (!placesLib) return;
    let cancelled = false;

    const lookupPlace = async () => {
      try {
        const { places } = await placesLib.Place.searchByText({
          textQuery: searchQuery,
          fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
        });
        const first = places?.[0];
        const loc = first?.location;
        if (!cancelled && loc) {
          const lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
          const lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
          const entry: ResolvedShowroomPlace = {
            lat,
            lng,
            formattedAddress: first.formattedAddress ?? undefined,
            googleMapsURI: first.googleMapsURI || fallbackMapsUrl,
          };
          resolvedPlaceCache[locationId] = entry;
          setResolvedById((prev) => ({ ...prev, [locationId]: entry }));
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(15);
          }
        }
      } catch (err) {
        const msg = String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('QuotaExceededError') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
      }
    };

    lookupPlace();

    return () => {
      cancelled = true;
    };
  }, [placesLib, map, locationId, searchQuery, fallbackMapsUrl]);

  const targetUrl = resolved?.googleMapsURI || fallbackMapsUrl;
  const CornerArrow = dir === 'rtl' ? ArrowUpLeft : ArrowUpRight;

  return (
    <div className="overflow-hidden rounded-2xl bg-canvas ring-1 ring-line">
      <div className="relative h-[250px] w-full">
        <Map
          mapId="DEMO_MAP_ID"
          defaultZoom={resolved ? 15 : 14}
          defaultCenter={resolved ? { lat: resolved.lat, lng: resolved.lng } : { lat: 35.5613, lng: 45.4304 }}
          gestureHandling="greedy"
          disableDefaultUI={false}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="size-full"
        >
          {resolved && (
            <AdvancedMarker
              position={{ lat: resolved.lat, lng: resolved.lng }}
              title={cityLabel}
            >
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={openMapsLabel}
                className="block cursor-pointer"
              >
                <Pin
                  background="#191816"
                  borderColor="#191816"
                  glyphColor="#f5f2eb"
                  scale={1.15}
                />
              </a>
            </AdvancedMarker>
          )}
        </Map>

        {/* Top floating location badge on the map */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute start-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-card/95 px-3.5 py-1.5 text-[12px] shadow-tile ring-1 ring-line backdrop-blur-md transition-colors hover:bg-ink hover:text-canvas"
        >
          <MapPin className="size-3.5 shrink-0 text-accent" />
          <span className="truncate font-medium">{cityLabel}</span>
          <ExternalLink className="size-3 shrink-0 opacity-70" />
        </a>
      </div>

      {/* Clickable bar that opens the place directly in Google Maps in the browser */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-3 border-t border-line bg-card px-4 py-3 text-[13px] transition-colors hover:bg-ink hover:text-canvas"
      >
        <div className="min-w-0">
          <p className="font-medium">{openMapsLabel}</p>
          <p className="truncate text-[11.5px] text-ink-soft group-hover:text-canvas/75">
            {resolved?.formattedAddress || addressLabel}
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-canvas text-ink transition-transform group-hover:scale-105">
          <CornerArrow className="size-4" />
        </span>
      </a>
    </div>
  );
}

export function ShowroomGoogleMap({
  locationId,
  searchQuery,
  cityLabel,
  addressLabel,
  openMapsLabel,
  locale,
  dir,
}: {
  locationId: string;
  searchQuery: string;
  cityLabel: string;
  addressLabel: string;
  openMapsLabel: string;
  locale: Locale;
  dir: 'ltr' | 'rtl';
}) {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    ((globalThis as unknown as Record<string, string>).GOOGLE_MAPS_API_KEY ?? '');

  const fallbackMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    searchQuery
  )}`;

  if (!apiKey) {
    return (
      <a
        href={fallbackMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-line transition-colors hover:bg-sand"
      >
        <div>
          <p className="font-medium text-ink">{cityLabel}</p>
          <p className="mt-0.5 text-[12px] text-ink-soft">{addressLabel}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent">
            <span>{openMapsLabel}</span>
            <ExternalLink className="size-3.5" />
          </p>
        </div>
      </a>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      language={locale === 'ar' ? 'ar' : 'en'}
      region="IQ"
    >
      <ShowroomMapCanvas
        locationId={locationId}
        searchQuery={searchQuery}
        cityLabel={cityLabel}
        addressLabel={addressLabel}
        openMapsLabel={openMapsLabel}
        dir={dir}
      />
    </APIProvider>
  );
}
