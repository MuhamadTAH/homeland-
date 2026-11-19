# Kvist Architectural Showroom - Sanity Studio Installer for D:\test (Clean & Easy Kurdish / English Workspaces)
# Run inside PowerShell at D:\test:
#   powershell -ExecutionPolicy Bypass -File .\deploy-to-sanity.ps1
# Then run:
#   npx sanity deploy

$ErrorActionPreference = "Stop"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
function Write-Utf8File {
  param([string]$Path, [string]$Content)
  $fullPath = Join-Path (Get-Location) $Path
  [System.IO.File]::WriteAllText($fullPath, $Content, $utf8NoBom)
}

New-Item -ItemType Directory -Force -Path "schemaTypes" | Out-Null
New-Item -ItemType Directory -Force -Path "plugins" | Out-Null

# ---------------------------------------------------------
# 1. schemaTypes/buildSchemas.ts (Pure single-language schemas)
# ---------------------------------------------------------
Write-Utf8File "schemaTypes/buildSchemas.ts" @'
export type StudioLang = 'ckb' | 'en';

export function buildSchemaTypes(lang: StudioLang) {
  const k = lang === 'ckb';

  const productSchema = {
    name: 'product',
    title: k ? '\u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5\u06A9\u0627\u0646' : 'Architectural Product',
    type: 'document',
    groups: [
      { name: 'essentials', title: k ? '\u0660\u0661. \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC' : '01. Essentials', default: true },
      { name: 'media', title: k ? '\u0660\u0662. \u0648\u06CE\u0646\u06D5 \u0648 \u0663\u0666\u0660\u00B0' : '02. Media & 360\u00B0' },
      { name: 'finishes', title: k ? '\u0660\u0663. \u0695\u06D5\u0646\u06AF \u0648 \u067E\u06CE\u0648\u0627\u0646\u06D5' : '03. Finishes & Specs' },
    ],
    fields: [
      {
        name: 'name',
        title: k ? '\u0646\u0627\u0648\u06CC \u0628\u06D5\u0631\u0647\u06D5\u0645' : 'Product Name',
        type: 'string',
        group: 'essentials',
        validation: (Rule: any) => Rule.required().max(120),
      },
      {
        name: 'slug',
        title: k ? '\u0628\u06D5\u0633\u062A\u06D5\u0631 (Slug)' : 'Slug (URL Identifier - Optional)',
        type: 'slug',
        group: 'essentials',
        options: {
          source: 'name',
          maxLength: 96,
          slugify: (input: string) =>
            (input || '')
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 96) || `piece-${Date.now().toString(36)}`,
        },
      },
      {
        name: 'category',
        title: k ? '\u0628\u06D5\u0634' : 'Category',
        type: 'string',
        group: 'essentials',
        options: {
          list: [
            { title: k ? '\u0642\u06D5\u0646\u06D5\u0641\u06D5 \u0648 \u06A9\u0648\u0631\u0633\u06CC' : 'Sofas & Chairs', value: 'seating' },
            { title: k ? '\u06AF\u06B5\u06C6\u067E \u0648 \u0686\u0631\u0627' : 'Lamps & Lights', value: 'lighting' },
            { title: k ? '\u0645\u06CE\u0632' : 'Tables', value: 'tables' },
            { title: k ? '\u0642\u0648\u0645\u0627\u0634 \u0648 \u0633\u06D5\u0631\u06CC\u0646' : 'Textiles & Cushions', value: 'textiles' },
            { title: k ? '\u0633\u06CC\u0631\u0627\u0645\u06CC\u06A9 \u0648 \u06AF\u0648\u06B5\u062F\u0627\u0646' : 'Vases & Ceramics', value: 'ceramics' },
          ],
        },
        initialValue: 'seating',
      },
      {
        name: 'price',
        title: k ? '\u0646\u0631\u062E ($ \u062F\u06C6\u0644\u0627\u0631)' : 'Price ($ USD)',
        type: 'number',
        group: 'essentials',
        initialValue: 450,
      },
      {
        name: 'status',
        title: k ? '\u062F\u06C6\u062E\u06CC \u0628\u06B5\u0627\u0648\u0628\u0648\u0648\u0646\u06D5\u0648\u06D5' : 'Catalog Status',
        type: 'string',
        group: 'essentials',
        options: {
          list: [
            { title: k ? '\u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u0648 (\u0644\u06D5 \u0648\u06CE\u0628\u0633\u0627\u06CC\u062A)' : 'Active (Live on website)', value: 'active' },
            { title: k ? '\u0695\u06D5\u0634\u0646\u0648\u0648\u0633 (\u0634\u0627\u0631\u0627\u0648\u06D5)' : 'Draft (Hidden)', value: 'draft' },
          ],
          layout: 'radio',
        },
        initialValue: 'active',
      },
      {
        name: 'stock',
        title: k ? '\u0698\u0645\u0627\u0631\u06D5\u06CC \u06A9\u06C6\u06AF\u0627' : 'Showroom Stock Count',
        type: 'number',
        group: 'essentials',
        initialValue: 8,
      },
      {
        name: 'badge',
        title: k ? '\u0646\u06CC\u0634\u0627\u0646\u06D5' : 'Badge / Highlight Label',
        type: 'string',
        group: 'essentials',
      },
      {
        name: 'blurb',
        title: k ? '\u0648\u06D5\u0633\u0641\u06CC \u0628\u06D5\u0631\u0647\u06D5\u0645' : 'Editorial Overview',
        type: 'text',
        rows: 3,
        group: 'essentials',
      },
      {
        name: 'position',
        title: k ? '\u0695\u06CC\u0632\u0628\u06D5\u0646\u062F\u06CC' : 'Display Order',
        type: 'number',
        group: 'essentials',
        initialValue: 1,
      },
      {
        name: 'image',
        title: k ? '\u0648\u06CE\u0646\u06D5\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC' : 'Main Product Image',
        type: 'image',
        group: 'media',
        options: { hotspot: true },
      },
      {
        name: 'scene',
        title: k ? '\u0648\u06CE\u0646\u06D5\u06CC \u0646\u0627\u0648 \u0698\u0648\u0648\u0631' : 'Room Lifestyle Image',
        type: 'image',
        group: 'media',
        options: { hotspot: true },
      },
      {
        name: 'tint',
        title: k ? '\u0695\u06D5\u0646\u06AF\u06CC \u067E\u0627\u0634\u0628\u0646\u06D5\u0645\u0627' : 'Background Tint',
        type: 'string',
        group: 'media',
        options: {
          list: [
            { title: k ? '\u0628\u06D5\u0631\u062F\u06CC \u06AF\u06D5\u0631\u0645' : 'Stone', value: 'stone' },
            { title: k ? '\u0644\u0645\u06CC \u062E\u06C6\u0631\u06D5\u062A\u0627\u0648' : 'Sand', value: 'sand' },
            { title: k ? '\u0632\u06D5\u06CC\u062A\u0648\u0648\u0646\u06CC \u06A9\u0627\u06B5' : 'Sage', value: 'sage' },
            { title: k ? '\u0639\u0627\u062C\u06CC \u06AF\u06D5\u0631\u0645' : 'Butter', value: 'butter' },
            { title: k ? '\u06AF\u06B5\u06CC \u0633\u0648\u0648\u0631\u0628\u0627\u0648' : 'Blush', value: 'blush' },
            { title: k ? '\u0626\u0627\u0633\u0645\u0627\u0646\u06CC \u0647\u06CE\u0645\u0646' : 'Sky', value: 'sky' },
          ],
        },
        initialValue: 'stone',
      },
      {
        name: 'view360Type',
        title: k ? '\u0634\u06CE\u0648\u06D5\u06CC \u0645\u06C6\u062F\u06CE\u0644\u06CC \u0663\u0666\u0660\u00B0' : '360\u00B0 Turntable Shape',
        type: 'string',
        group: 'media',
        options: {
          list: [
            { title: k ? '\u062E\u06C6\u06A9\u0627\u0631' : 'Auto', value: 'auto' },
            { title: k ? '\u0642\u06D5\u0646\u06D5\u0641\u06D5 \u06CC\u0627\u0646 \u06A9\u0648\u0631\u0633\u06CC' : 'Lounge Chair / Sofa', value: 'chair' },
            { title: k ? '\u0645\u06CE\u0632' : 'Table / Desk', value: 'table' },
            { title: k ? '\u06AF\u06B5\u06C6\u067E \u0648 \u0686\u0631\u0627' : 'Lamp / Lighting', value: 'lamp' },
            { title: k ? '\u06AF\u0648\u06B5\u062F\u0627\u0646 \u06CC\u0627\u0646 \u0642\u0648\u0645\u0627\u0634' : 'Vase / Object / Textile', value: 'vase' },
          ],
        },
        initialValue: 'auto',
      },
      {
        name: 'frames360',
        title: k ? '\u0648\u06CE\u0646\u06D5\u06A9\u0627\u0646\u06CC \u06AF\u06C6\u0634\u06D5\u06CC \u0663\u0666\u0660\u00B0' : '360\u00B0 Multi-Angle Photos',
        type: 'array',
        group: 'media',
        of: [{ type: 'image', options: { hotspot: true } }],
      },
      {
        name: 'dimensions',
        title: k ? '\u0642\u06D5\u0628\u0627\u0631\u06D5 \u0648 \u067E\u06CE\u0648\u0627\u0646\u06D5' : 'Dimensions',
        type: 'string',
        group: 'finishes',
      },
      {
        name: 'material',
        title: k ? '\u06A9\u06D5\u0631\u06D5\u0633\u062A\u06D5\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC' : 'Primary Material',
        type: 'string',
        group: 'finishes',
      },
      {
        name: 'weight',
        title: k ? '\u06A9\u06CE\u0634' : 'Weight',
        type: 'string',
        group: 'finishes',
      },
      {
        name: 'warranty',
        title: k ? '\u06AF\u06D5\u0631\u06D5\u0646\u062A\u06CC' : 'Warranty',
        type: 'string',
        group: 'finishes',
      },
      {
        name: 'leadTime',
        title: k ? '\u0628\u06D5\u0631\u062F\u06D5\u0633\u062A\u0628\u0648\u0648\u0646 \u0644\u06D5 \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627' : 'Showroom Availability',
        type: 'string',
        group: 'finishes',
      },
      {
        name: 'finishes',
        title: k ? '\u0695\u06D5\u0646\u06AF \u0648 \u0695\u0648\u0648\u067E\u06C6\u0634\u06D5\u06A9\u0627\u0646' : 'Material Finishes & Swatches',
        type: 'array',
        group: 'finishes',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'name', title: k ? '\u0646\u0627\u0648\u06CC \u0695\u06D5\u0646\u06AF' : 'Finish Name', type: 'string' },
              { name: 'color', title: k ? '\u06A9\u06C6\u062F\u06CC \u0695\u06D5\u0646\u06AF (Hex)' : 'Hex Color (e.g. #d8c4a4)', type: 'string' },
              { name: 'soldOut', title: k ? '\u0646\u06D5\u0645\u0627\u0648\u06D5\u061F' : 'Sold Out?', type: 'boolean', initialValue: false },
              { name: 'stock', title: k ? '\u0698\u0645\u0627\u0631\u06D5\u06CC \u0626\u06D5\u0645 \u0695\u06D5\u0646\u06AF\u06D5' : 'Color Stock', type: 'number' },
            ],
          },
        ],
      },
      {
        name: 'details',
        title: k ? '\u062E\u0627\u06B5\u06D5 \u06AF\u0631\u0646\u06AF\u06D5\u06A9\u0627\u0646\u06CC \u062F\u0631\u0648\u0633\u062A\u06A9\u0631\u062F\u0646' : 'Construction Highlights',
        type: 'array',
        group: 'finishes',
        of: [{ type: 'string' }],
      },
      {
        name: 'specifications',
        title: k ? '\u067E\u06CE\u0648\u0627\u0646\u06D5 \u062A\u0627\u06CC\u0628\u06D5\u062A\u06D5\u06A9\u0627\u0646' : 'Custom Specifications',
        type: 'array',
        group: 'finishes',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'label', title: k ? '\u0646\u0627\u0648\u0646\u06CC\u0634\u0627\u0646' : 'Label', type: 'string' },
              { name: 'value', title: k ? '\u0628\u06D5\u0647\u0627' : 'Value', type: 'string' },
            ],
          },
        ],
      },
      {
        name: 'care',
        title: k ? '\u067E\u0627\u0631\u0627\u0633\u062A\u0646 \u0648 \u062E\u0627\u0648\u06CE\u0646\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5' : 'Care & Maintenance',
        type: 'text',
        rows: 2,
        group: 'finishes',
      },
    ],
    preview: {
      select: {
        title: 'name',
        subtitle: 'category',
        media: 'image',
        price: 'price',
      },
      prepare({ title, subtitle, media, price }: any) {
        return {
          title: title || (k ? '\u0628\u06D5\u0631\u0647\u06D5\u0645\u06CC \u0628\u06CE\u0646\u0627\u0648' : 'Untitled Piece'),
          subtitle: `${subtitle || 'catalog'} \u00B7 $${price || 0}`,
          media,
        };
      },
    },
  };

  const categorySchema = {
    name: 'category',
    title: k ? '\u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646' : 'Collection',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: k ? '\u0646\u0627\u0648\u06CC \u0628\u06D5\u0634' : 'Collection Name',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'slug',
        title: k ? '\u0628\u06D5\u0633\u062A\u06D5\u0631 (Slug)' : 'Slug',
        type: 'slug',
        options: {
          source: 'name',
          slugify: (input: string) =>
            (input || '')
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .slice(0, 96) || `cat-${Date.now().toString(36)}`,
        },
      },
      {
        name: 'position',
        title: k ? '\u0695\u06CC\u0632\u0628\u06D5\u0646\u062F\u06CC' : 'Order Position',
        type: 'number',
        initialValue: 1,
      },
    ],
  };

  const roomSceneSchema = {
    name: 'roomScene',
    title: k ? '\u062F\u06CC\u0645\u06D5\u0646\u06CC \u0698\u0648\u0648\u0631' : 'Shoppable Room Vignette',
    type: 'document',
    fields: [
      { name: 'title', title: k ? '\u0633\u06D5\u0631\u062F\u06CE\u0695' : 'Headline Override', type: 'string' },
      { name: 'eyebrow', title: k ? '\u0646\u0627\u0648\u0646\u06CC\u0634\u0627\u0646\u06CC \u0633\u06D5\u0631\u06D5\u0648\u06D5' : 'Eyebrow Label Override', type: 'string' },
      {
        name: 'image',
        title: k ? '\u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631' : 'Room Photograph',
        type: 'image',
        options: { hotspot: true },
      },
      {
        name: 'hotspots',
        title: k ? '\u062E\u0627\u06B5\u06D5 \u06A9\u0627\u0631\u0644\u06CE\u06A9\u06A9\u0627\u0631\u06D5\u06A9\u0627\u0646' : 'Interactive Product Hotspots',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'product', title: k ? '\u0628\u06D5\u0631\u0647\u06D5\u0645\u06CC \u0628\u06D5\u0633\u062A\u0631\u0627\u0648' : 'Linked Product', type: 'reference', to: [{ type: 'product' }] },
              { name: 'productId', title: k ? '\u06A9\u06C6\u062F\u06CC \u0628\u06D5\u0631\u0647\u06D5\u0645' : 'Product Slug / ID', type: 'string' },
              { name: 'x', title: k ? '\u0634\u0648\u06CE\u0646\u06CC \u0626\u0627\u0633\u06C6\u06CC\u06CC X%' : 'X% (0-100)', type: 'number' },
              { name: 'y', title: k ? '\u0634\u0648\u06CE\u0646\u06CC \u0633\u062A\u0648\u0648\u0646\u06CC Y%' : 'Y% (0-100)', type: 'number' },
            ],
          },
        ],
      },
    ],
  };

  const teamMemberSchema = {
    name: 'teamMember',
    title: k ? '\u062A\u06CC\u0645\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627' : 'Studio Team Member',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: k ? '\u0646\u0627\u0648\u06CC \u062A\u06D5\u0648\u0627\u0648' : 'Full Name',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'role',
        title: k ? '\u0626\u06D5\u0631\u06A9 \u0644\u06D5 \u0633\u062A\u06C6\u062F\u06CC\u06C6' : 'Studio Role',
        type: 'string',
        options: {
          list: [
            { title: k ? '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u06D5\u0631\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627' : 'Showroom Director', value: 'Showroom Director' },
            { title: k ? '\u0633\u06D5\u0631\u067E\u06D5\u0631\u0634\u062A\u06CC\u0627\u0631\u06CC \u06A9\u06D5\u062A\u06D5\u0644\u06C6\u06AF' : 'Catalog Curator', value: 'Catalog Curator' },
            { title: k ? '\u0648\u06CE\u0646\u06D5\u06AF\u0631\u06CC \u0628\u06D5\u0631\u0647\u06D5\u0645' : 'Product Photographer', value: 'Product Photographer' },
            { title: k ? '\u062A\u06D5\u0644\u0627\u0631\u0633\u0627\u0632\u06CC \u0646\u0627\u0648\u062E\u06C6' : 'Interior Architect', value: 'Interior Architect' },
            { title: k ? '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u06D5\u0631\u06CC \u06A9\u06C6\u06AF\u0627' : 'Inventory Manager', value: 'Inventory Manager' },
          ],
        },
        initialValue: 'Catalog Curator',
      },
      { name: 'email', title: k ? '\u0626\u06CC\u0645\u06D5\u06CC\u06B5' : 'Email', type: 'string' },
      { name: 'location', title: k ? '\u0644\u0642\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627' : 'Showroom Branch', type: 'string', initialValue: k ? '\u0633\u0644\u06CE\u0645\u0627\u0646\u06CC' : 'Sulaymaniyah' },
      { name: 'avatar', title: k ? '\u0648\u06CE\u0646\u06D5\u06CC \u06A9\u06D5\u0633\u06CC' : 'Portrait', type: 'image', options: { hotspot: true } },
      { name: 'active', title: k ? '\u0686\u0627\u0644\u0627\u06A9\u06D5' : 'Active Member', type: 'boolean', initialValue: true },
    ],
  };

  return [productSchema, categorySchema, roomSceneSchema, teamMemberSchema];
}
'@

# ---------------------------------------------------------
# 2. schemaTypes/index.ts
# ---------------------------------------------------------
Write-Utf8File "schemaTypes/index.ts" @'
import { buildSchemaTypes } from './buildSchemas';

export { buildSchemaTypes } from './buildSchemas';
export const schemaTypes = buildSchemaTypes('ckb');
'@

# ---------------------------------------------------------
# 3. plugins/kvistDashboard.tsx (Cleaner, Easier, Responsive Kurdish + English)
# ---------------------------------------------------------
Write-Utf8File "plugins/kvistDashboard.tsx" @'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { definePlugin, useClient, useCurrentUser } from 'sanity';

type Lang = 'ckb' | 'en';
type TabView = 'overview' | 'products' | 'collections' | 'room' | 'team';
type EditorTab = 'essentials' | 'media' | 'finishes';

interface FinishItem {
  _key?: string;
  name: string;
  color: string;
  soldOut?: boolean;
  stock?: number;
}

interface Frame360Item {
  _key?: string;
  _type?: 'image';
  asset?: { _type?: 'reference'; _ref: string };
  url?: string;
}

interface ProductRow {
  _id: string;
  _rawId?: string;
  isSanityDraft?: boolean;
  name: string;
  slug?: { current?: string };
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft';
  badge?: string | null;
  blurb?: string;
  dimensions?: string;
  material?: string;
  weight?: string;
  warranty?: string;
  leadTime?: string;
  care?: string;
  tint?: string;
  view360Type?: string;
  position?: number;
  image?: any;
  scene?: any;
  imageUrl?: string;
  sceneUrl?: string;
  finishes?: FinishItem[];
  details?: string[];
  frames360?: any[];
}

interface CategoryRow {
  _id: string;
  name: string;
  slug?: { current?: string };
  position?: number;
}

interface TeamRow {
  _id: string;
  name: string;
  role: string;
  email?: string;
  location?: string;
  active?: boolean;
}

interface RoomSceneRow {
  _id: string;
  title?: string;
  eyebrow?: string;
  image?: any;
  imageUrl?: string;
  hotspots?: Array<{ _key?: string; productId: string; x: number; y: number }>;
}

interface AssetRow {
  _id: string;
  url: string;
  originalFilename?: string;
}

const I18N = {
  ckb: {
    langKurdishBtn: '\u06A9\u0648\u0631\u062F\u06CC',
    langEnglishBtn: 'English',
    brandName: 'KVIST',
    studioTag: '\u0633\u062A\u06C6\u062F\u06CC\u06C6',
    workspaceLabel: '\u062F\u0627\u0634\u0628\u06C6\u0631\u062F\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627',
    navOverview: '\u067E\u0648\u062E\u062A\u06D5\u06CC \u06AF\u0634\u062A\u06CC',
    navProducts: '\u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5\u06A9\u0627\u0646',
    navCollections: '\u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646',
    navRoom: '\u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631',
    navTeam: '\u062A\u06CC\u0645 \u0648 \u062F\u06D5\u0633\u06D5\u06B5\u0627\u062A',
    sanityCloud: '\u0647\u06D5\u0648\u0631\u06CC Sanity',
    syncBtn: '\u0646\u0648\u06CE\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5',
    pcsUnit: '\u067E\u0627\u0631\u0686\u06D5',
    signedIn: '\u0647\u06D5\u0698\u0645\u0627\u0631',
    crumbPrefix: '\u0633\u062A\u06C6\u062F\u06CC\u06C6',
    titleOverview: '\u067E\u0648\u062E\u062A\u06D5\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627',
    titleProducts: '\u0628\u06D5\u0631\u0647\u06D5\u0645 \u0648 \u06A9\u06C6\u06AF\u0627',
    titleCollections: '\u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627',
    titleRoom: '\u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631\u06CC \u06A9\u0627\u0631\u0644\u06CE\u06A9\u06A9\u0627\u0631',
    titleTeam: '\u062A\u06CC\u0645 \u0648 \u062F\u06D5\u0633\u06D5\u06B5\u0627\u062A\u06D5\u06A9\u0627\u0646',
    subtitleOverview: '\u0628\u06D5 \u062E\u06CE\u0631\u0627\u06CC\u06CC \u0686\u0627\u0648\u062F\u06CE\u0631\u06CC \u06A9\u06C6\u06AF\u0627\u060C \u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5 \u06A9\u06D5\u0645\u06D5\u06A9\u0627\u0646 \u0648 \u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646 \u0628\u06A9\u06D5.',
    subtitleProducts: '\u067E\u0627\u0631\u0686\u06D5 \u0632\u06CC\u0627\u062F \u0628\u06A9\u06D5\u060C \u0646\u0631\u062E \u0648 \u06A9\u06C6\u06AF\u0627 \u0628\u06AF\u06C6\u0695\u06D5\u060C \u06CC\u0627\u0646 \u067E\u0627\u0631\u0686\u06D5\u06CC\u06D5\u06A9 \u06A9\u06C6\u067E\u06CC \u0628\u06A9\u06D5.',
    subtitleCollections: '\u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646\u06CC \u0641\u0631\u06C6\u0634\u06AF\u0627 \u0695\u06CE\u06A9\u0628\u062E\u06D5 \u0628\u06D5 \u06A9\u0627\u0631\u062A\u06D5\u06CC \u0695\u0648\u0648\u0646 \u0648 \u0626\u0627\u0633\u0627\u0646.',
    subtitleRoom: '\u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631 \u0628\u0627\u0631\u0628\u06A9\u06D5 \u0648 \u0628\u06D5 \u06A9\u0631\u062A\u06D5\u06CC\u06D5\u06A9 \u062E\u0627\u06B5\u06CC \u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5\u06A9\u0627\u0646 \u0644\u06D5\u0633\u06D5\u0631 \u0648\u06CE\u0646\u06D5\u06A9\u06D5 \u062F\u0627\u0628\u0646\u06CE.',
    subtitleTeam: '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u0631\u062F\u0646\u06CC \u062F\u06D5\u0633\u06D5\u06B5\u0627\u062A\u06CC \u0628\u06D5\u06A9\u0627\u0631\u0647\u06CE\u0646\u06D5\u0631\u0627\u0646 \u0648 \u0626\u06D5\u0646\u062F\u0627\u0645\u0627\u0646\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627.',
    newPieceBtn: '+ \u0632\u06CC\u0627\u062F\u06A9\u0631\u062F\u0646\u06CC \u067E\u0627\u0631\u0686\u06D5\u06CC \u0646\u0648\u06CE',
    loadingCatalog: '\u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC\u06D5\u06A9\u0627\u0646 \u062F\u06D5\u0647\u06CE\u0646\u0631\u06CE\u0646\u2026',
    kpiLive: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u0648\u06D5\u06A9\u0627\u0646',
    kpiLiveSub: '\u06A9\u06C6\u06CC \u06A9\u06C6\u06AF\u0627:',
    kpiLow: '\u06A9\u06C6\u06AF\u0627\u06CC \u06A9\u06D5\u0645',
    kpiLowSub: '\u06A9\u06D5\u0645\u062A\u0631 \u0644\u06D5 \u0664 \u062F\u0627\u0646\u06D5 \u0645\u0627\u0648\u06D5',
    kpiCollections: '\u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646',
    kpiCollectionsSub: '\u06A9\u0644\u06CC\u06A9 \u0628\u06A9\u06D5 \u0628\u06C6 \u0695\u06CE\u06A9\u062E\u0633\u062A\u0646',
    kpiDrafts: '\u0695\u06D5\u0634\u0646\u0648\u0648\u0633\u06D5\u06A9\u0627\u0646',
    kpiDraftsSub: '\u0644\u06D5 \u0633\u06D5\u0631\u062F\u0627\u0646\u06A9\u06D5\u0631 \u0634\u0627\u0631\u0627\u0648\u06D5\u06CC\u06D5',
    quickActionsTitle: '\u06A9\u0627\u0631\u06D5 \u062E\u06CE\u0631\u0627\u06A9\u0627\u0646',
    qaAddTitle: '\u0632\u06CC\u0627\u062F\u06A9\u0631\u062F\u0646\u06CC \u067E\u0627\u0631\u0686\u06D5',
    qaAddSub: '\u0648\u06CE\u0646\u06D5\u060C \u0646\u0631\u062E \u0648 \u0695\u06D5\u0646\u06AF \u062F\u0627\u0628\u0646\u06CE',
    qaLowTitle: '\u067E\u0634\u06A9\u0646\u06CC\u0646\u06CC \u06A9\u06D5\u0645\u0628\u0648\u0648\u06D5\u06A9\u0627\u0646',
    qaLowSub: '\u067E\u06CC\u0634\u0627\u0646\u062F\u0627\u0646\u06CC \u06A9\u06C6\u06AF\u0627 \u06A9\u06D5\u0645\u06D5\u06A9\u0627\u0646',
    qaRoomTitle: '\u062F\u06D5\u0633\u062A\u06A9\u0627\u0631\u06CC \u062E\u0627\u06B5\u06D5\u06A9\u0627\u0646\u06CC \u0698\u0648\u0648\u0631',
    qaRoomSub: '\u062F\u06CC\u0627\u0631\u06CC\u06A9\u0631\u062F\u0646\u06CC \u067E\u0627\u0631\u0686\u06D5 \u0644\u06D5 \u0698\u0648\u0648\u0631\u062F\u0627',
    priorityInventory: '\u0646\u0648\u06CE\u062A\u0631\u06CC\u0646 \u0648 \u067E\u06CE\u0648\u06CC\u0633\u062A\u062A\u0631\u06CC\u0646 \u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5\u06A9\u0627\u0646',
    openAll: '\u0628\u06CC\u0646\u06CC\u0646\u06CC \u0647\u06D5\u0645\u0648\u0648\u06CC',
    collectionBalance: '\u062F\u0627\u0628\u06D5\u0634\u0628\u0648\u0648\u0646\u06CC \u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646',
    liveLabel: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u0648',
    draftLabel: '\u0695\u06D5\u0634\u0646\u0648\u0648\u0633',
    editBtn: '\u062F\u06D5\u0633\u062A\u06A9\u0627\u0631\u06CC',
    duplicateBtn: '\u06A9\u06C6\u067E\u06CC',
    editPieceBtn: '\u062F\u06D5\u0633\u062A\u06A9\u0627\u0631\u06CC',
    filterAll: '\u0647\u06D5\u0645\u0648\u0648\u06CC',
    filterLive: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u0648',
    filterDraft: '\u0695\u06D5\u0634\u0646\u0648\u0648\u0633',
    filterLow: '\u06A9\u06C6\u06AF\u0627\u06CC \u06A9\u06D5\u0645',
    allCollections: '\u0647\u06D5\u0645\u0648\u0648 \u0628\u06D5\u0634\u06D5\u06A9\u0627\u0646',
    searchPlaceholder: '\u06AF\u06D5\u0695\u0627\u0646 \u0628\u06D5\u062F\u0648\u0627\u06CC \u0646\u0627\u0648\u2026',
    gridView: '\u06A9\u0627\u0631\u062A',
    tableView: '\u062E\u0634\u062A\u06D5',
    emptyTitle: '\u0647\u06CC\u0686 \u0628\u06D5\u0631\u0647\u06D5\u0645\u06CE\u06A9 \u0646\u06D5\u062F\u06C6\u0632\u0631\u0627\u06CC\u06D5\u0648\u06D5',
    emptyHint: '\u0641\u0644\u062A\u06D5\u0631\u06D5\u06A9\u06D5 \u067E\u0627\u06A9 \u0628\u06A9\u06D5\u0631\u06D5\u0648\u06D5 \u06CC\u0627\u0646 \u067E\u0627\u0631\u0686\u06D5\u06CC\u06D5\u06A9\u06CC \u0646\u0648\u06CE \u0632\u06CC\u0627\u062F \u0628\u06A9\u06D5.',
    resetFiltersBtn: '\u067E\u06CC\u0634\u0627\u0646\u062F\u0627\u0646\u06CC \u0647\u06D5\u0645\u0648\u0648\u06CC',
    stockLabel: '\u06A9\u06C6\u06AF\u0627',
    newCollectionPlaceholder: '\u0646\u0627\u0648\u06CC \u0628\u06D5\u0634\u06CC \u0646\u0648\u06CE \u0628\u0646\u0648\u0648\u0633\u06D5 (\u0646\u0645\u0648\u0648\u0646\u06D5: \u0698\u0648\u0648\u0631\u06CC \u0645\u06CC\u0648\u0627\u0646)',
    addCollectionBtn: '+ \u0632\u06CC\u0627\u062F\u06A9\u0631\u062F\u0646\u06CC \u0628\u06D5\u0634',
    viewPiecesBtn: '\u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5\u06A9\u0627\u0646\u06CC \u0646\u0627\u0648\u06CC',
    deleteBtn: '\u0633\u0695\u06CC\u0646\u06D5\u0648\u06D5',
    confirmDeleteBtn: '\u062F\u06B5\u0646\u06CC\u0627\u06CC\u061F \u0628\u0633\u0695\u06D5\u0648\u06D5',
    cancelTinyBtn: '\u067E\u0627\u0634\u06AF\u06D5\u0632',
    roomUploadLabel: '\u06AF\u06C6\u0695\u06CC\u0646\u06CC \u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631',
    roomHint: '\u0661. \u067E\u0627\u0631\u0686\u06D5\u06A9\u06D5 \u0647\u06D5\u06B5\u0628\u0698\u06CE\u0631\u06D5   \u0662. \u06A9\u0631\u062A\u06D5 \u0644\u06D5 \u0634\u0648\u06CE\u0646\u06CC \u067E\u0627\u0631\u0686\u06D5\u06A9\u06D5 \u0628\u06A9\u06D5 \u0644\u06D5\u0633\u06D5\u0631 \u0648\u06CE\u0646\u06D5\u06A9\u06D5.',
    roomPinsTitle: '\u062E\u0627\u06B5\u06D5 \u062F\u0627\u0646\u0631\u0627\u0648\u06D5\u06A9\u0627\u0646 \u0644\u06D5\u0633\u06D5\u0631 \u0648\u06CE\u0646\u06D5',
    roomNoPins: '\u0647\u06CE\u0634\u062A\u0627 \u0647\u06CC\u0686 \u062E\u0627\u06B5\u06CE\u06A9 \u062F\u0627\u0646\u06D5\u0646\u0631\u0627\u0648\u06D5.',
    noRoomMsg: '\u0647\u06CE\u0634\u062A\u0627 \u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631 \u0628\u0627\u0631\u0646\u06D5\u06A9\u0631\u0627\u0648\u06D5. \u0644\u06D5 \u062F\u0648\u06AF\u0645\u06D5\u06CC \u0633\u06D5\u0631\u06D5\u0648\u06D5 \u0648\u06CE\u0646\u06D5\u06CC\u06D5\u06A9 \u0647\u06D5\u06B5\u0628\u0698\u06CE\u0631\u06D5.',
    activeAccount: '\u0647\u06D5\u0698\u0645\u06CE\u0631\u06CC \u0686\u0627\u0644\u0627\u06A9\u06CC \u0626\u06CE\u0633\u062A\u0627',
    studioOwner: '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u06D5\u0631',
    projectLabel: '\u067E\u0631\u06C6\u0698\u06D5',
    manageMembersBtn: '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u0631\u062F\u0646\u06CC \u062F\u06D5\u0633\u06D5\u06B5\u0627\u062A \u0644\u06D5 Sanity',
    teamDirectory: '\u0626\u06D5\u0646\u062F\u0627\u0645\u0627\u0646\u06CC \u062A\u06CC\u0645\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627',
    fullNamePh: '\u0646\u0627\u0648\u06CC \u062A\u06D5\u0648\u0627\u0648',
    emailPh: '\u0626\u06CC\u0645\u06D5\u06CC\u06B5',
    branchPh: '\u0644\u0642 (\u0633\u0644\u06CE\u0645\u0627\u0646\u06CC)',
    defaultBranch: '\u0633\u0644\u06CE\u0645\u0627\u0646\u06CC',
    addMemberBtn: '+ \u0632\u06CC\u0627\u062F\u06A9\u0631\u062F\u0646',
    noTeamYet: '\u0647\u06CE\u0634\u062A\u0627 \u0647\u06CC\u0686 \u0626\u06D5\u0646\u062F\u0627\u0645\u06CE\u06A9\u06CC \u062A\u06CC\u0645 \u062A\u06C6\u0645\u0627\u0631 \u0646\u06D5\u06A9\u0631\u0627\u0648\u06D5.',
    removeBtn: '\u0644\u0627\u0628\u0631\u062F\u0646',
    drawerEditPrefix: '\u062F\u06D5\u0633\u062A\u06A9\u0627\u0631\u06CC\u06A9\u0631\u062F\u0646\u06CC:',
    drawerNewTitle: '\u067E\u0627\u0631\u0686\u06D5\u06CC\u06D5\u06A9\u06CC \u0646\u0648\u06CE \u0632\u06CC\u0627\u062F \u0628\u06A9\u06D5',
    drawerCopyTitle: '\u06A9\u06C6\u067E\u06CC \u067E\u0627\u0631\u0686\u06D5:',
    drawerSubtitle: '\u062A\u06D5\u0646\u0647\u0627 \u0632\u0627\u0646\u06CC\u0627\u0631\u06CC\u06CC\u06D5 \u0633\u06D5\u0631\u06D5\u06A9\u06CC\u06CC\u06D5\u06A9\u0627\u0646 \u067E\u0695\u0628\u06A9\u06D5\u0631\u06D5\u0648\u06D5 \u0648 \u067E\u0627\u0634\u06D5\u06A9\u06D5\u0648\u062A \u0628\u06A9\u06D5.',
    previewLabel: '\u067E\u06CE\u0634\u0628\u06CC\u0646\u06CC \u06A9\u0627\u0631\u062A \u0644\u06D5 \u0641\u0631\u06C6\u0634\u06AF\u0627',
    tabEssentials: '\u0661. \u0633\u06D5\u0631\u06D5\u06A9\u06CC',
    tabMedia: '\u0662. \u0648\u06CE\u0646\u06D5 \u0648 \u0663\u0666\u0660\u00B0',
    tabFinishes: '\u0663. \u0695\u06D5\u0646\u06AF \u0648 \u0642\u06D5\u0628\u0627\u0631\u06D5',
    fieldName: '\u0646\u0627\u0648\u06CC \u067E\u0627\u0631\u0686\u06D5 *',
    fieldNamePh: '\u0646\u0645\u0648\u0648\u0646\u06D5: \u06A9\u0648\u0631\u0633\u06CC \u067E\u0634\u0648\u0648\u06CC \u0626\u0627\u0631\u0627\u0645',
    fieldCollection: '\u0628\u06D5\u0634',
    fieldStatus: '\u0628\u06B5\u0627\u0648\u0628\u0648\u0648\u0646\u06D5\u0648\u06D5',
    statusActiveOpt: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u0648 (\u0647\u06D5\u0645\u0648\u0648\u0627\u0646 \u062F\u06D5\u06CC\u0628\u06CC\u0646\u0646)',
    statusDraftOpt: '\u0695\u06D5\u0634\u0646\u0648\u0648\u0633 (\u0634\u0627\u0631\u0627\u0648\u06D5)',
    fieldPrice: '\u0646\u0631\u062E ($ \u062F\u06C6\u0644\u0627\u0631)',
    fieldStock: '\u06A9\u06C6\u06CC \u06A9\u06C6\u06AF\u0627',
    fieldBadge: '\u0646\u06CC\u0634\u0627\u0646\u06D5 (\u0626\u0627\u0631\u06D5\u0632\u0648\u0648\u0645\u06D5\u0646\u062F\u0627\u0646\u06D5)',
    fieldBadgePh: '\u06AF\u06D5\u06CC\u0634\u062A\u0646\u06CC \u0646\u0648\u06CE',
    fieldBlurb: '\u0648\u06D5\u0633\u0641\u06CC \u06A9\u0648\u0631\u062A',
    fieldBlurbPh: '\u0686\u06D5\u0646\u062F \u062F\u06CE\u0695\u06CE\u06A9 \u062F\u06D5\u0631\u0628\u0627\u0631\u06D5\u06CC \u06A9\u06D5\u0631\u06D5\u0633\u062A\u06D5 \u0648 \u062F\u06CC\u0632\u0627\u06CC\u0646\u2026',
    fieldMainImg: '\u0648\u06CE\u0646\u06D5\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC \u067E\u0627\u0631\u0686\u06D5',
    noMainImg: '\u0648\u06CE\u0646\u06D5 \u0646\u06CC\u06CC\u06D5',
    fieldSceneImg: '\u0648\u06CE\u0646\u06D5\u06CC \u0646\u0627\u0648 \u0698\u0648\u0648\u0631 (\u0626\u0627\u0631\u06D5\u0632\u0648\u0648\u0645\u06D5\u0646\u062F\u0627\u0646\u06D5)',
    noSceneImg: '\u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631 \u0646\u06CC\u06CC\u06D5',
    uploadFileBtn: '\u0628\u0627\u0631\u06A9\u0631\u062F\u0646 \u0644\u06D5 \u06A9\u06C6\u0645\u067E\u06CC\u0648\u062A\u06D5\u0631',
    pickSanityBtn: '\u0644\u06D5 \u0648\u06CE\u0646\u06D5\u06A9\u0627\u0646\u06CC Sanity \u0647\u06D5\u06B5\u0628\u0698\u06CE\u0631\u06D5',
    clearImgBtn: '\u0644\u0627\u0628\u0631\u062F\u0646',
    uploading: '\u0628\u0627\u0631\u062F\u06D5\u06A9\u0631\u06CE\u062A\u2026',
    fieldTint: '\u0695\u06D5\u0646\u06AF\u06CC \u0628\u0627\u06A9\u06AF\u0631\u0627\u0648\u0646\u062F\u06CC \u06A9\u0627\u0631\u062A',
    field360Shape: '\u0634\u06CE\u0648\u06D5\u06CC \u0645\u06C6\u062F\u06CE\u0644\u06CC \u0663\u0666\u0660\u00B0',
    frames360Title: '\u0648\u06CE\u0646\u06D5\u06A9\u0627\u0646\u06CC \u06AF\u06C6\u0634\u06D5\u06CC \u0663\u0666\u0660\u00B0',
    frames360Hint: '\u062F\u06D5\u062A\u0648\u0627\u0646\u06CC\u062A \u0686\u06D5\u0646\u062F \u0648\u06CE\u0646\u06D5\u06CC\u06D5\u06A9 \u067E\u06CE\u06A9\u06D5\u0648\u06D5 \u0647\u06D5\u06B5\u0628\u0698\u06CE\u0631\u06CC\u062A \u0628\u06C6 \u062E\u0648\u0644\u0627\u0646\u06D5\u0648\u06D5\u06CC \u0663\u0666\u0660\u00B0.',
    add360Btn: '+ \u0632\u06CC\u0627\u062F\u06A9\u0631\u062F\u0646\u06CC \u0648\u06CE\u0646\u06D5\u06CC \u0663\u0666\u0660\u00B0',
    fieldDimensions: '\u0642\u06D5\u0628\u0627\u0631\u06D5 \u0648 \u067E\u06CE\u0648\u0627\u0646\u06D5',
    fieldMaterial: '\u06A9\u06D5\u0631\u06D5\u0633\u062A\u06D5\u06CC \u0633\u06D5\u0631\u06D5\u06A9\u06CC',
    defaultMaterial: '\u062F\u0627\u0631\u06D5 \u0628\u06D5\u0695\u0648\u0648\u06CC \u0626\u06D5\u0648\u0631\u0648\u067E\u06CC',
    defaultSwatchName: '\u062F\u0627\u0631\u06D5 \u0628\u06D5\u0695\u0648\u0648\u06CC \u0633\u0631\u0648\u0634\u062A\u06CC',
    quickSwatch: '\u06A9\u0644\u06CC\u06A9 \u0628\u06A9\u06D5 \u0628\u06C6 \u0632\u06CC\u0627\u062F\u06A9\u0631\u062F\u0646\u06CC \u0695\u06D5\u0646\u06AF',
    availableLabel: '\u0628\u06D5\u0631\u062F\u06D5\u0633\u062A\u06D5',
    soldOutLabel: '\u0646\u06D5\u0645\u0627\u0648\u06D5',
    highlightsLabel: '\u062E\u0627\u06B5\u06D5 \u06AF\u0631\u0646\u06AF\u06D5\u06A9\u0627\u0646 (\u0647\u06D5\u0631 \u062E\u0627\u06B5\u06CE\u06A9 \u0644\u06D5 \u062F\u06CE\u0695\u06CE\u06A9\u062F\u0627)',
    highlightsPh: '\u0686\u0648\u0627\u0631\u0686\u06CE\u0648\u06D5\u06CC \u062F\u0627\u0631\u06D5 \u0628\u06D5\u0695\u0648\u0648\n\u0628\u06D5\u0633\u062A\u0646\u06CC \u0626\u06D5\u0646\u062F\u0627\u0632\u06CC\u0627\u0631\u06CC \u0648\u0631\u062F',
    deletePieceBtn: '\u0633\u0695\u06CC\u0646\u06D5\u0648\u06D5\u06CC \u067E\u0627\u0631\u0686\u06D5',
    cancelBtn: '\u062F\u0627\u062E\u0633\u062A\u0646',
    nextTabBtn: '\u0647\u06D5\u0646\u06AF\u0627\u0648\u06CC \u062F\u0648\u0627\u062A\u0631 \u2192',
    saveSanityBtn: '\u067E\u0627\u0634\u06D5\u06A9\u06D5\u0648\u062A \u0648 \u0628\u06B5\u0627\u0648\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5',
    savingBtn: '\u067E\u0627\u0634\u06D5\u06A9\u06D5\u0648\u062A \u062F\u06D5\u06A9\u0631\u06CE\u062A\u2026',
    toastUploaded: '\u0648\u06CE\u0646\u06D5\u06A9\u06D5 \u0628\u06D5 \u0633\u06D5\u0631\u06A9\u06D5\u0648\u062A\u0648\u0648\u06CC\u06CC \u0628\u0627\u0631\u06A9\u0631\u0627',
    toastUploadFail: '\u0628\u0627\u0631\u06A9\u0631\u062F\u0646\u06CC \u0648\u06CE\u0646\u06D5 \u0633\u06D5\u0631\u06A9\u06D5\u0648\u062A\u0648\u0648 \u0646\u06D5\u0628\u0648\u0648',
    toastNeedName: '\u062A\u06A9\u0627\u06CC\u06D5 \u0633\u06D5\u0631\u06D5\u062A\u0627 \u0646\u0627\u0648\u06CC \u067E\u0627\u0631\u0686\u06D5\u06A9\u06D5 \u0628\u0646\u0648\u0648\u0633\u06D5',
    toastUpdated: '\u06AF\u06C6\u0695\u0627\u0646\u06A9\u0627\u0631\u06CC\u06CC\u06D5\u06A9\u0627\u0646 \u067E\u0627\u0634\u06D5\u06A9\u06D5\u0648\u062A \u06A9\u0631\u0627\u0646',
    toastCreated: '\u067E\u0627\u0631\u0686\u06D5 \u0646\u0648\u06CE\u06CC\u06D5\u06A9\u06D5 \u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u06CC\u06D5\u0648\u06D5',
    toastDeleted: '\u0633\u0695\u0627\u06CC\u06D5\u0648\u06D5:',
    toastCollectionAdded: '\u0628\u06D5\u0634\u06D5 \u0646\u0648\u06CE\u06CC\u06D5\u06A9\u06D5 \u0632\u06CC\u0627\u062F\u06A9\u0631\u0627',
    toastMemberAdded: '\u0626\u06D5\u0646\u062F\u0627\u0645 \u0632\u06CC\u0627\u062F\u06A9\u0631\u0627',
    toastMemberRemoved: '\u0626\u06D5\u0646\u062F\u0627\u0645 \u0644\u0627\u0628\u0631\u0627',
    toastHotspotAdded: '\u062E\u0627\u06B5 \u062F\u0627\u0646\u062F\u0631\u0627',
    toastHotspotRemoved: '\u062E\u0627\u06B5 \u0644\u0627\u0628\u0631\u0627',
    toastRoomUploaded: '\u0648\u06CE\u0646\u06D5\u06CC \u0698\u0648\u0648\u0631 \u0646\u0648\u06CE\u06A9\u0631\u0627\u06CC\u06D5\u0648\u06D5',
    unpublishedBadge: '\u0695\u06D5\u0634\u0646\u0648\u0648\u0633\u06CC Sanity \u00B7 \u0628\u06B5\u0627\u0648\u0646\u06D5\u06A9\u0631\u0627\u0648\u06D5',
    publishNowBtn: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5\u06CC \u0626\u06CE\u0633\u062A\u0627',
    publishAllBtn: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u062F\u0646\u06D5\u0648\u06D5\u06CC \u0647\u06D5\u0645\u0648\u0648 \u0695\u06D5\u0634\u0646\u0648\u0648\u0633\u06D5\u06A9\u0627\u0646',
    publishAllHint: '\u0628\u06D5\u0631\u0647\u06D5\u0645\u06D5\u06A9\u0627\u0646 \u0647\u06CE\u0634\u062A\u0627 \u0644\u06D5 \u0695\u06D5\u0634\u0646\u0648\u0648\u0633\u062F\u0627\u0646 \u0648 \u0644\u06D5 \u0648\u06CE\u0628\u0633\u0627\u06CC\u062A \u062F\u06D5\u0631\u0646\u0627\u06A9\u06D5\u0648\u0646 \u062A\u0627 \u0628\u06B5\u0627\u0648 \u0646\u06D5\u06A9\u0631\u06CE\u0646\u06D5\u0648\u06D5.',
    publishedUnit: '\u0628\u06B5\u0627\u0648\u06A9\u0631\u0627\u0648',
    mediaModalTitle: '\u0647\u06D5\u06B5\u0628\u0698\u0627\u0631\u062F\u0646 \u0644\u06D5 \u06A9\u062A\u06CE\u0628\u062E\u0627\u0646\u06D5\u06CC Sanity',
    mediaModalEmpty: '\u0647\u06CC\u0686 \u0648\u06CE\u0646\u06D5\u06CC\u06D5\u06A9 \u0646\u06D5\u062F\u06C6\u0632\u0631\u0627\u06CC\u06D5\u0648\u06D5.',
    cats: {
      seating: '\u0642\u06D5\u0646\u06D5\u0641\u06D5 \u0648 \u06A9\u0648\u0631\u0633\u06CC',
      lighting: '\u06AF\u06B5\u06C6\u067E \u0648 \u0686\u0631\u0627',
      tables: '\u0645\u06CE\u0632',
      textiles: '\u0642\u0648\u0645\u0627\u0634 \u0648 \u0633\u06D5\u0631\u06CC\u0646',
      ceramics: '\u0633\u06CC\u0631\u0627\u0645\u06CC\u06A9 \u0648 \u06AF\u0648\u06B5\u062F\u0627\u0646',
    } as Record<string, string>,
    tints: [
      { value: 'stone', label: '\u0628\u06D5\u0631\u062F', hex: '#ece7df' },
      { value: 'sand', label: '\u0644\u0645', hex: '#efe4d2' },
      { value: 'sage', label: '\u0632\u06D5\u06CC\u062A\u0648\u0648\u0646', hex: '#e2e8de' },
      { value: 'butter', label: '\u0639\u0627\u062C\u06CC', hex: '#f5eedc' },
      { value: 'blush', label: '\u06AF\u06B5\u06CC', hex: '#f0dfd8' },
      { value: 'sky', label: '\u0626\u0627\u0633\u0645\u0627\u0646\u06CC', hex: '#e1e7ec' },
    ],
    shapes360: [
      { value: 'auto', label: '\u062E\u06C6\u06A9\u0627\u0631' },
      { value: 'chair', label: '\u0642\u06D5\u0646\u06D5\u0641\u06D5 \u0648 \u06A9\u0648\u0631\u0633\u06CC' },
      { value: 'table', label: '\u0645\u06CE\u0632' },
      { value: 'lamp', label: '\u06AF\u06B5\u06C6\u067E \u0648 \u0686\u0631\u0627' },
      { value: 'vase', label: '\u06AF\u0648\u06B5\u062F\u0627\u0646 \u0648 \u0642\u0648\u0645\u0627\u0634' },
    ],
    swatches: [
      { name: '\u062F\u0627\u0631\u06D5 \u0628\u06D5\u0695\u0648\u0648\u06CC \u0633\u0631\u0648\u0634\u062A\u06CC', color: '#d8c4a4' },
      { name: '\u06AF\u06C6\u0632\u06D5\u06CC \u062F\u0648\u06A9\u06D5\u06B5\u0627\u0648\u06CC', color: '#5b402c' },
      { name: '\u0628\u0648\u0648\u06A9\u0644\u06CE\u06CC \u0633\u067E\u06CC', color: '#f3efe7' },
      { name: '\u06AF\u06B5\u06CC \u0633\u0648\u0648\u0631\u0628\u0627\u0648', color: '#b85d3b' },
      { name: '\u0632\u06D5\u06CC\u062A\u0648\u0648\u0646\u06CC \u0647\u06CE\u0645\u0646', color: '#6b7760' },
      { name: '\u0695\u06D5\u0634\u06CC \u062E\u06D5\u06B5\u0648\u0648\u0632', color: '#2b2927' },
      { name: '\u0628\u06D5\u0631\u062F\u06CC \u0644\u0645', color: '#cbb99d' },
      { name: '\u062E\u06C6\u06B5\u06D5\u0645\u06CE\u0634\u06CC \u0633\u0627\u0631\u062F', color: '#848e96' },
    ],
    roles: [
      { value: 'Showroom Director', label: '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u06D5\u0631\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627' },
      { value: 'Catalog Curator', label: '\u0633\u06D5\u0631\u067E\u06D5\u0631\u0634\u062A\u06CC\u0627\u0631\u06CC \u06A9\u06D5\u062A\u06D5\u0644\u06C6\u06AF' },
      { value: 'Product Photographer', label: '\u0648\u06CE\u0646\u06D5\u06AF\u0631\u06CC \u0628\u06D5\u0631\u0647\u06D5\u0645' },
      { value: 'Interior Architect', label: '\u062A\u06D5\u0644\u0627\u0631\u0633\u0627\u0632\u06CC \u0646\u0627\u0648\u062E\u06C6' },
      { value: 'Inventory Manager', label: '\u0628\u06D5\u0695\u06CE\u0648\u06D5\u0628\u06D5\u0631\u06CC \u06A9\u06C6\u06AF\u0627' },
    ],
  },
  en: {
    langKurdishBtn: '\u06A9\u0648\u0631\u062F\u06CC',
    langEnglishBtn: 'English',
    brandName: 'KVIST',
    studioTag: 'Studio',
    workspaceLabel: 'Showroom Workspace',
    navOverview: 'Overview',
    navProducts: 'Products',
    navCollections: 'Collections',
    navRoom: 'Room Photo',
    navTeam: 'Team',
    sanityCloud: 'Sanity Cloud',
    syncBtn: 'Refresh',
    pcsUnit: 'pcs',
    signedIn: 'Account',
    crumbPrefix: 'Studio',
    titleOverview: 'Showroom Overview',
    titleProducts: 'Products & Stock',
    titleCollections: 'Collections',
    titleRoom: 'Shoppable Room Photo',
    titleTeam: 'Team & Access',
    subtitleOverview: 'Quick view of live catalog pieces, low stock items, and collections.',
    subtitleProducts: 'Add pieces, adjust stock inline, toggle visibility, or duplicate.',
    subtitleCollections: 'Organize the collections shown in your storefront navigation.',
    subtitleRoom: 'Upload a showroom photo and click to place clickable product pins.',
    subtitleTeam: 'Manage Sanity permissions and showroom team directory.',
    newPieceBtn: '+ Add New Piece',
    loadingCatalog: 'Loading catalog\u2026',
    kpiLive: 'Live Pieces',
    kpiLiveSub: 'Total stock:',
    kpiLow: 'Low Stock',
    kpiLowSub: '3 or fewer left',
    kpiCollections: 'Collections',
    kpiCollectionsSub: 'Click to organize',
    kpiDrafts: 'Drafts',
    kpiDraftsSub: 'Hidden from visitors',
    quickActionsTitle: 'Quick Actions',
    qaAddTitle: 'Add a Piece',
    qaAddSub: 'Upload photo, set price & colors',
    qaLowTitle: 'Check Low Stock',
    qaLowSub: 'Filter items running low',
    qaRoomTitle: 'Tag Room Photo',
    qaRoomSub: 'Place product dots on scene',
    priorityInventory: 'Needs Attention & Recent',
    openAll: 'Open All',
    collectionBalance: 'Collection Balance',
    liveLabel: 'Live',
    draftLabel: 'Draft',
    editBtn: 'Edit',
    duplicateBtn: 'Copy',
    editPieceBtn: 'Edit Piece',
    filterAll: 'All',
    filterLive: 'Live',
    filterDraft: 'Draft',
    filterLow: 'Low Stock',
    allCollections: 'All Collections',
    searchPlaceholder: 'Search by name\u2026',
    gridView: 'Cards',
    tableView: 'List',
    emptyTitle: 'No matching pieces found',
    emptyHint: 'Clear your filters or add a new showroom piece.',
    resetFiltersBtn: 'Show All',
    stockLabel: 'Stock',
    newCollectionPlaceholder: 'New collection name (e.g. Dining Room)',
    addCollectionBtn: '+ Add Collection',
    viewPiecesBtn: 'View Pieces',
    deleteBtn: 'Delete',
    confirmDeleteBtn: 'Confirm Delete?',
    cancelTinyBtn: 'Cancel',
    roomUploadLabel: 'Change Room Photo',
    roomHint: '1. Pick a product   2. Click directly on the photo to place a pin.',
    roomPinsTitle: 'Placed Pins',
    roomNoPins: 'No pins placed yet.',
    noRoomMsg: 'No showroom vignette uploaded yet. Upload a room photo above.',
    activeAccount: 'Active Account',
    studioOwner: 'Studio Owner',
    projectLabel: 'Project',
    manageMembersBtn: 'Manage Sanity Access',
    teamDirectory: 'Showroom Team Directory',
    fullNamePh: 'Full name',
    emailPh: 'Email',
    branchPh: 'Branch (Sulaymaniyah)',
    defaultBranch: 'Sulaymaniyah',
    addMemberBtn: '+ Add',
    noTeamYet: 'No team profiles added yet.',
    removeBtn: 'Remove',
    drawerEditPrefix: 'Editing:',
    drawerNewTitle: 'Add New Piece',
    drawerCopyTitle: 'Duplicate Piece:',
    drawerSubtitle: 'Fill essentials, upload a photo, and save directly to Sanity.',
    previewLabel: 'Storefront Card Preview',
    tabEssentials: '1. Essentials',
    tabMedia: '2. Photos & 360\u00B0',
    tabFinishes: '3. Colors & Size',
    fieldName: 'Piece Name *',
    fieldNamePh: 'e.g. Lounge Chair',
    fieldCollection: 'Collection',
    fieldStatus: 'Visibility',
    statusActiveOpt: 'Live (Visible on site)',
    statusDraftOpt: 'Draft (Hidden)',
    fieldPrice: 'Price ($ USD)',
    fieldStock: 'Stock Count',
    fieldBadge: 'Badge (Optional)',
    fieldBadgePh: 'New arrival',
    fieldBlurb: 'Short Description',
    fieldBlurbPh: 'A few clear lines about materials and comfort\u2026',
    fieldMainImg: 'Main Product Photo',
    noMainImg: 'No photo',
    fieldSceneImg: 'Room Scene (Optional)',
    noSceneImg: 'No scene photo',
    uploadFileBtn: 'Upload from Computer',
    pickSanityBtn: 'Pick from Sanity Media',
    clearImgBtn: 'Clear',
    uploading: 'Uploading\u2026',
    fieldTint: 'Card Backdrop Color',
    field360Shape: '360\u00B0 Interactive Shape',
    frames360Title: '360\u00B0 Multi-Angle Photos',
    frames360Hint: 'Select multiple angle photos for interactive 360\u00B0 spin.',
    add360Btn: '+ Add 360\u00B0 Photos',
    fieldDimensions: 'Dimensions',
    fieldMaterial: 'Primary Material',
    defaultMaterial: 'Solid European Oak',
    defaultSwatchName: 'Natural Oak',
    quickSwatch: 'Click to Add Color Swatch',
    availableLabel: 'Available',
    soldOutLabel: 'Sold Out',
    highlightsLabel: 'Highlights (one per line)',
    highlightsPh: 'Solid European oak frame\nMortise and tenon joinery',
    deletePieceBtn: 'Delete Piece',
    cancelBtn: 'Close',
    nextTabBtn: 'Next Step \u2192',
    saveSanityBtn: 'Save & Publish',
    savingBtn: 'Saving\u2026',
    toastUploaded: 'Photo uploaded cleanly',
    toastUploadFail: 'Photo upload failed',
    toastNeedName: 'Please enter a product name first',
    toastUpdated: 'Saved changes',
    toastCreated: 'Published new piece',
    toastDeleted: 'Deleted:',
    toastCollectionAdded: 'Collection added',
    toastMemberAdded: 'Team member added',
    toastMemberRemoved: 'Team member removed',
    toastHotspotAdded: 'Pin placed',
    toastHotspotRemoved: 'Pin removed',
    toastRoomUploaded: 'Room photo updated',
    unpublishedBadge: 'Unpublished Draft',
    publishNowBtn: 'Publish Now',
    publishAllBtn: 'Publish All Drafts',
    publishAllHint: 'These pieces are still Sanity Studio drafts and are hidden from the public website until published.',
    publishedUnit: 'published',
    mediaModalTitle: 'Pick from Sanity Media Library',
    mediaModalEmpty: 'No uploaded photos found yet.',
    cats: {
      seating: 'Sofas & Chairs',
      lighting: 'Lamps & Lights',
      tables: 'Tables',
      textiles: 'Textiles & Cushions',
      ceramics: 'Vases & Ceramics',
    } as Record<string, string>,
    tints: [
      { value: 'stone', label: 'Stone', hex: '#ece7df' },
      { value: 'sand', label: 'Sand', hex: '#efe4d2' },
      { value: 'sage', label: 'Sage', hex: '#e2e8de' },
      { value: 'butter', label: 'Butter', hex: '#f5eedc' },
      { value: 'blush', label: 'Blush', hex: '#f0dfd8' },
      { value: 'sky', label: 'Sky', hex: '#e1e7ec' },
    ],
    shapes360: [
      { value: 'auto', label: 'Auto' },
      { value: 'chair', label: 'Lounge Chair / Sofa' },
      { value: 'table', label: 'Table / Desk' },
      { value: 'lamp', label: 'Lamp / Lighting' },
      { value: 'vase', label: 'Vase / Object / Textile' },
    ],
    swatches: [
      { name: 'Natural Oak', color: '#d8c4a4' },
      { name: 'Smoked Walnut', color: '#5b402c' },
      { name: 'Boucl\u00E9 Chalk', color: '#f3efe7' },
      { name: 'Warm Terracotta', color: '#b85d3b' },
      { name: 'Sage Olive', color: '#6b7760' },
      { name: 'Charcoal Ash', color: '#2b2927' },
      { name: 'Sandstone', color: '#cbb99d' },
      { name: 'Slate Mist', color: '#848e96' },
    ],
    roles: [
      { value: 'Showroom Director', label: 'Showroom Director' },
      { value: 'Catalog Curator', label: 'Catalog Curator' },
      { value: 'Product Photographer', label: 'Product Photographer' },
      { value: 'Interior Architect', label: 'Interior Architect' },
      { value: 'Inventory Manager', label: 'Inventory Manager' },
    ],
  },
};

const COLORS = {
  canvas: '#faf8f5',
  card: '#ffffff',
  ink: '#181715',
  inkSoft: '#6e6a63',
  inkFaint: '#9b958b',
  line: '#e8e3da',
  accent: '#b85d3b',
  accentSoft: '#f6e7e0',
  ok: '#2f5b44',
  okSoft: '#e5efe9',
  warn: '#a6621a',
  warnSoft: '#faeedf',
  danger: '#9b3022',
  dangerSoft: '#f9e6e3',
};

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `piece-${Date.now()}`
  );
}

function emptyDraft(lang: Lang, defaultCat = 'seating') {
  const c = I18N[lang];
  return {
    _id: '',
    isDuplicate: false,
    name: '',
    slug: '',
    category: defaultCat,
    price: 450,
    stock: 8,
    status: 'active' as 'active' | 'draft',
    badge: '',
    blurb: '',
    dimensions: '80 \u00D7 80 \u00D7 75 cm',
    material: c.defaultMaterial,
    weight: '14 kg',
    warranty: '5-Year Structural Warranty',
    leadTime: '',
    care: '',
    tint: 'stone',
    view360Type: 'chair',
    position: 1,
    image: null as any,
    imageUrl: '',
    scene: null as any,
    sceneUrl: '',
    frames360: [] as Frame360Item[],
    finishes: [
      { _key: 'f1', name: c.defaultSwatchName, color: '#d8c4a4', soldOut: false },
    ] as FinishItem[],
    detailsText: '',
  };
}

function createWorkspaceComponent(workspaceLang: Lang) {
  return function KvistStudioWorkspace() {
    const client = useClient({ apiVersion: '2024-03-01' });
    const currentUser = useCurrentUser();

    const [lang, setLang] = useState<Lang>(workspaceLang);
    const copy = I18N[lang];
    const isRtl = lang === 'ckb';

    const switchLang = (next: Lang) => {
      if (next === lang) return;
      setLang(next);
      if (typeof window !== 'undefined') {
        const targetBase = next === 'ckb' ? '/ckb' : '/en';
        if (!window.location.pathname.startsWith(targetBase)) {
          window.location.assign(targetBase);
        }
      }
    };

    const [tab, setTab] = useState<TabView>('overview');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const [products, setProducts] = useState<ProductRow[]>([]);
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [team, setTeam] = useState<TeamRow[]>([]);
    const [roomScene, setRoomScene] = useState<RoomSceneRow | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'low'>('all');
    const [catFilter, setCatFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editorTab, setEditorTab] = useState<EditorTab>('essentials');
    const [draft, setDraft] = useState(() => emptyDraft(workspaceLang));
    const [uploadingField, setUploadingField] = useState<'image' | 'scene' | 'frames' | 'room' | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const [mediaPickerTarget, setMediaPickerTarget] = useState<'image' | 'scene' | 'frames' | null>(null);
    const [assets, setAssets] = useState<AssetRow[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(false);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [newMember, setNewMember] = useState({
      name: '',
      role: 'Catalog Curator',
      email: '',
      location: copy.defaultBranch,
    });

    const [spotProductId, setSpotProductId] = useState('');

    const showToast = useCallback((msg: string) => {
      setToast(msg);
      setTimeout(() => setToast((prev) => (prev === msg ? null : prev)), 3200);
    }, []);

    const loadAll = useCallback(async () => {
      setLoading(true);
      try {
        const [prods, cats, members, scene] = await Promise.all([
          client.fetch<ProductRow[]>(
            `*[_type == "product"] | order(position asc, _createdAt desc) {
              _id, name, slug, category, price, stock, status, badge, blurb,
              dimensions, material, weight, warranty, leadTime, care, tint, view360Type,
              position, image, scene, finishes, details,
              "imageUrl": image.asset->url,
              "sceneUrl": scene.asset->url,
              "frames360": frames360[]{ _key, _type, asset, "url": asset->url }
            }`
          ),
          client.fetch<CategoryRow[]>(
            `*[_type == "category"] | order(position asc, _createdAt asc) { _id, name, slug, position }`
          ),
          client.fetch<TeamRow[]>(
            `*[_type == "teamMember"] | order(_createdAt asc) { _id, name, role, email, location, active }`
          ),
          client.fetch<RoomSceneRow | null>(
            `*[_type == "roomScene"] | order(_updatedAt desc)[0] {
              _id, title, eyebrow, image, hotspots,
              "imageUrl": image.asset->url
            }`
          ),
        ]);
        const rawList = Array.isArray(prods) ? prods : [];
        const byCleanId = new Map<string, ProductRow>();
        rawList.forEach((row) => {
          const isDraftDoc = row._id.startsWith('drafts.');
          const cleanId = row._id.replace(/^drafts\./, '');
          const prev = byCleanId.get(cleanId);
          if (!prev || isDraftDoc) {
            byCleanId.set(cleanId, {
              ...row,
              _id: cleanId,
              _rawId: row._id,
              isSanityDraft: isDraftDoc,
            });
          }
        });
        const merged = Array.from(byCleanId.values());
        setProducts(merged);
        setCategories(Array.isArray(cats) ? cats : []);
        setTeam(Array.isArray(members) ? members : []);
        setRoomScene(scene || null);
        if (merged.length > 0 && !spotProductId) {
          setSpotProductId(merged[0].slug?.current || merged[0]._id);
        }
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setLoading(false);
      }
    }, [client, showToast, spotProductId]);

    useEffect(() => {
      loadAll();
    }, [loadAll]);

    const openMediaLibrary = async (target: 'image' | 'scene' | 'frames') => {
      setMediaPickerTarget(target);
      setLoadingAssets(true);
      try {
        const rows = await client.fetch<AssetRow[]>(
          `*[_type == "sanity.imageAsset"] | order(_createdAt desc)[0...36] { _id, url, originalFilename }`
        );
        setAssets(Array.isArray(rows) ? rows : []);
      } catch {
        setAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    };

    const pickSanityAsset = (asset: AssetRow) => {
      const refObj = { _type: 'image' as const, asset: { _type: 'reference' as const, _ref: asset._id } };
      if (mediaPickerTarget === 'image') {
        setDraft((prev) => ({ ...prev, image: refObj, imageUrl: asset.url }));
      } else if (mediaPickerTarget === 'scene') {
        setDraft((prev) => ({ ...prev, scene: refObj, sceneUrl: asset.url }));
      } else if (mediaPickerTarget === 'frames') {
        setDraft((prev) => ({
          ...prev,
          frames360: [...prev.frames360, { ...refObj, _key: `frame_${Date.now()}`, url: asset.url }],
        }));
      }
      setMediaPickerTarget(null);
    };

    const categoryOptions = useMemo(() => {
      const map = new Map<string, string>();
      Object.entries(copy.cats).forEach(([id, label]) => map.set(id, label));
      categories.forEach((c) => {
        const id = c.slug?.current || slugify(c.name);
        map.set(id, c.name);
      });
      return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
    }, [categories, copy.cats]);

    const catLabel = useCallback(
      (id: string) => categoryOptions.find((c) => c.id === id)?.label || id,
      [categoryOptions]
    );

    const stats = useMemo(() => {
      const live = products.filter((p) => p.status !== 'draft').length;
      const drafts = products.filter((p) => p.status === 'draft').length;
      const sanityDrafts = products.filter((p) => p.isSanityDraft).length;
      const sanityPublished = products.length - sanityDrafts;
      const lowStock = products.filter((p) => (p.stock ?? 0) <= 3).length;
      const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      return {
        total: products.length,
        live,
        drafts,
        sanityDrafts,
        sanityPublished,
        lowStock,
        totalStock,
        collections: categoryOptions.length,
      };
    }, [products, categoryOptions.length]);

    const categoryBreakdown = useMemo(() => {
      const total = Math.max(products.length, 1);
      return categoryOptions.map((c) => {
        const count = products.filter((p) => p.category === c.id).length;
        return {
          ...c,
          count,
          pct: Math.round((count / total) * 100),
        };
      });
    }, [products, categoryOptions]);

    const priorityRows = useMemo(() => {
      return [...products]
        .sort((a, b) => {
          const aLow = (a.stock ?? 0) <= 3 ? 0 : 1;
          const bLow = (b.stock ?? 0) <= 3 ? 0 : 1;
          if (aLow !== bLow) return aLow - bLow;
          return (a.stock ?? 0) - (b.stock ?? 0);
        })
        .slice(0, 6);
    }, [products]);

    const filteredProducts = useMemo(() => {
      return products.filter((p) => {
        if (statusFilter === 'active' && p.status === 'draft') return false;
        if (statusFilter === 'draft' && p.status !== 'draft') return false;
        if (statusFilter === 'low' && (p.stock ?? 0) > 3) return false;
        if (catFilter !== 'all' && p.category !== catFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const hit =
            (p.name || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.material || '').toLowerCase().includes(q);
          if (!hit) return false;
        }
        return true;
      });
    }, [products, statusFilter, catFilter, search]);

    const openNewPiece = () => {
      setConfirmDeleteId(null);
      setDraft(emptyDraft(lang, categoryOptions[0]?.id || 'seating'));
      setEditorTab('essentials');
      setDrawerOpen(true);
    };

    const loadProductIntoDraft = (p: ProductRow, asDuplicate = false) => {
      setConfirmDeleteId(null);
      setDraft({
        _id: asDuplicate ? '' : p._id,
        isDuplicate: asDuplicate,
        name: asDuplicate ? `${p.name} (Copy)` : p.name || '',
        slug: asDuplicate ? '' : p.slug?.current || '',
        category: p.category || 'seating',
        price: Number(p.price) || 0,
        stock: Number(p.stock) ?? 0,
        status: asDuplicate ? 'draft' : p.status === 'draft' ? 'draft' : 'active',
        badge: p.badge || '',
        blurb: p.blurb || '',
        dimensions: p.dimensions || '',
        material: p.material || '',
        weight: p.weight || '',
        warranty: p.warranty || '',
        leadTime: p.leadTime || '',
        care: p.care || '',
        tint: p.tint || 'stone',
        view360Type: p.view360Type || 'chair',
        position: Number(p.position) || 1,
        image: p.image || null,
        imageUrl: p.imageUrl || '',
        scene: p.scene || null,
        sceneUrl: p.sceneUrl || '',
        frames360: Array.isArray(p.frames360)
          ? p.frames360.filter((f: any) => Boolean(f?.asset?._ref || f?.url))
          : [],
        finishes:
          Array.isArray(p.finishes) && p.finishes.length > 0
            ? p.finishes.map((f, i) => ({
                _key: f._key || `f_${i}`,
                name: f.name,
                color: f.color,
                soldOut: Boolean(f.soldOut),
                stock: f.stock,
              }))
            : [{ _key: 'f1', name: copy.defaultSwatchName, color: '#d8c4a4', soldOut: false }],
        detailsText: Array.isArray(p.details) ? p.details.join('\n') : '',
      });
      setEditorTab('essentials');
      setDrawerOpen(true);
    };

    const handleUploadImage = async (
      field: 'image' | 'scene',
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingField(field);
      try {
        const asset = await client.assets.upload('image', file, { filename: file.name });
        const imageRef = {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        };
        setDraft((prev) => ({
          ...prev,
          [field]: imageRef,
          [field === 'image' ? 'imageUrl' : 'sceneUrl']: asset.url || '',
        }));
        showToast(copy.toastUploaded);
      } catch (err: any) {
        showToast(err?.message || copy.toastUploadFail);
      } finally {
        setUploadingField(null);
      }
    };

    const handleUploadFrames360 = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      setUploadingField('frames');
      try {
        const uploaded = await Promise.all(
          files.map(async (file, i) => {
            const asset = await client.assets.upload('image', file, { filename: file.name });
            return {
              _key: `frame_${Date.now()}_${i}`,
              _type: 'image' as const,
              asset: { _type: 'reference' as const, _ref: asset._id },
              url: asset.url,
            };
          })
        );
        setDraft((prev) => ({ ...prev, frames360: [...prev.frames360, ...uploaded] }));
        showToast(copy.toastUploaded);
      } catch (err: any) {
        showToast(err?.message || copy.toastUploadFail);
      } finally {
        setUploadingField(null);
      }
    };

    const handleUploadRoomPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingField('room');
      try {
        const asset = await client.assets.upload('image', file, { filename: file.name });
        const nextDoc = {
          _id: roomScene?._id || 'roomScene.primary',
          _type: 'roomScene',
          title: roomScene?.title || '',
          eyebrow: roomScene?.eyebrow || '',
          image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
          hotspots: roomScene?.hotspots || [],
        };
        await client.createOrReplace(nextDoc);
        setRoomScene({ ...nextDoc, imageUrl: asset.url });
        showToast(copy.toastRoomUploaded);
      } catch (err: any) {
        showToast(err?.message || copy.toastUploadFail);
      } finally {
        setUploadingField(null);
      }
    };

    const handleSaveProduct = async () => {
      if (!draft.name.trim()) {
        showToast(copy.toastNeedName);
        setEditorTab('essentials');
        return;
      }
      setSaving(true);
      try {
        const rawSlug = draft.slug.trim() || slugify(draft.name);
        const slugVal =
          rawSlug
            .toLowerCase()
            .replace(/[^a-z0-9-_]+/g, '-')
            .replace(/^-+|-+$/g, '') || `piece-${Date.now().toString(36)}`;
        const cleanExistingId = draft._id ? draft._id.replace(/^drafts\./, '') : '';
        const docId = cleanExistingId || `product.${slugVal}`;
        const doc: any = {
          _id: docId,
          _type: 'product',
          name: draft.name.trim(),
          slug: { _type: 'slug', current: slugVal },
          category: draft.category,
          price: Number(draft.price) || 0,
          stock: Number(draft.stock) || 0,
          status: draft.status,
          badge: draft.badge.trim() || null,
          blurb: draft.blurb.trim(),
          dimensions: draft.dimensions.trim() || '80 \u00D7 80 \u00D7 75 cm',
          material: draft.material.trim(),
          weight: draft.weight.trim(),
          warranty: draft.warranty.trim(),
          leadTime: draft.leadTime.trim(),
          care: draft.care.trim(),
          tint: draft.tint,
          view360Type: draft.view360Type,
          position: Number(draft.position) || 1,
          finishes: draft.finishes.map((f, i) => ({
            _key: f._key || `finish_${i}`,
            name: f.name,
            color: f.color,
            soldOut: Boolean(f.soldOut),
            ...(typeof f.stock === 'number' ? { stock: f.stock } : {}),
          })),
          details: draft.detailsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        };
        if (draft.image) doc.image = draft.image;
        if (draft.scene) doc.scene = draft.scene;
        if (draft.frames360.length > 0) {
          doc.frames360 = draft.frames360
            .filter((f) => Boolean(f.asset?._ref))
            .map((f, i) => ({
              _key: f._key || `frame_${i}`,
              _type: 'image',
              asset: f.asset,
            }));
        }

        await client.createOrReplace(doc);
        await client.delete(`drafts.${docId}`).catch(() => {});
        setDrawerOpen(false);
        showToast(cleanExistingId ? copy.toastUpdated : copy.toastCreated);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setSaving(false);
      }
    };

    const handlePublishDraftRow = async (p: ProductRow) => {
      setSaving(true);
      try {
        const cleanId = p._id.replace(/^drafts\./, '');
        const rawDoc = await client.fetch<any>(`*[_id == $draftId][0]`, {
          draftId: p._rawId || `drafts.${cleanId}`,
        });
        if (!rawDoc) return;
        const { _rev, _createdAt, _updatedAt, ...rest } = rawDoc;
        await client.createOrReplace({ ...rest, _id: cleanId });
        await client.delete(`drafts.${cleanId}`).catch(() => {});
        showToast(copy.toastCreated);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setSaving(false);
      }
    };

    const handlePublishAllDrafts = async () => {
      const draftRows = products.filter((p) => p.isSanityDraft);
      if (draftRows.length === 0) return;
      setSaving(true);
      try {
        for (const p of draftRows) {
          const cleanId = p._id.replace(/^drafts\./, '');
          const rawDoc = await client.fetch<any>(`*[_id == $draftId][0]`, {
            draftId: p._rawId || `drafts.${cleanId}`,
          });
          if (rawDoc) {
            const { _rev, _createdAt, _updatedAt, ...rest } = rawDoc;
            await client.createOrReplace({ ...rest, _id: cleanId });
            await client.delete(`drafts.${cleanId}`).catch(() => {});
          }
        }
        showToast(copy.toastCreated);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setSaving(false);
      }
    };

    const handleStepStock = async (p: ProductRow, delta: number) => {
      const nextStock = Math.max(0, (Number(p.stock) || 0) + delta);
      setProducts((prev) =>
        prev.map((item) => (item._id === p._id ? { ...item, stock: nextStock } : item))
      );
      try {
        await client.patch(p._rawId || p._id).set({ stock: nextStock }).commit();
        showToast(`${p.name}: ${nextStock}`);
      } catch {
        await loadAll();
      }
    };

    const handleToggleStatus = async (p: ProductRow) => {
      const nextStatus = p.status === 'draft' ? 'active' : 'draft';
      setProducts((prev) =>
        prev.map((item) => (item._id === p._id ? { ...item, status: nextStatus } : item))
      );
      try {
        await client.patch(p._rawId || p._id).set({ status: nextStatus }).commit();
        showToast(`${p.name}: ${nextStatus === 'draft' ? copy.draftLabel : copy.liveLabel}`);
      } catch {
        await loadAll();
      }
    };

    const handleDeleteProduct = async (p: ProductRow) => {
      setSaving(true);
      try {
        const cleanId = p._id.replace(/^drafts\./, '');
        await Promise.allSettled([
          client.delete(cleanId),
          client.delete(`drafts.${cleanId}`),
        ]);
        setDrawerOpen(false);
        setConfirmDeleteId(null);
        showToast(`${copy.toastDeleted} ${p.name}`);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setSaving(false);
      }
    };

    const handleAddCategory = async () => {
      if (!newCategoryName.trim()) return;
      setSaving(true);
      try {
        const slug = slugify(newCategoryName);
        await client.createOrReplace({
          _id: `category.${slug}`,
          _type: 'category',
          name: newCategoryName.trim(),
          slug: { _type: 'slug', current: slug },
          position: categories.length + 1,
        });
        setNewCategoryName('');
        showToast(copy.toastCollectionAdded);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setSaving(false);
      }
    };

    const handleDeleteCategory = async (cat: CategoryRow) => {
      try {
        await client.delete(cat._id);
        setConfirmDeleteId(null);
        showToast(`${copy.toastDeleted} ${cat.name}`);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      }
    };

    const handleAddTeamMember = async () => {
      if (!newMember.name.trim()) return;
      setSaving(true);
      try {
        await client.create({
          _type: 'teamMember',
          name: newMember.name.trim(),
          role: newMember.role,
          email: newMember.email.trim(),
          location: newMember.location.trim() || copy.defaultBranch,
          active: true,
        });
        setNewMember({ name: '', role: 'Catalog Curator', email: '', location: copy.defaultBranch });
        showToast(copy.toastMemberAdded);
        await loadAll();
      } catch (err: any) {
        showToast(err?.message || 'Error');
      } finally {
        setSaving(false);
      }
    };

    const handleRemoveTeamMember = async (id: string) => {
      try {
        await client.delete(id);
        setConfirmDeleteId(null);
        showToast(copy.toastMemberRemoved);
        await loadAll();
      } catch {
        showToast('Error');
      }
    };

    const handleRoomClick = async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!roomScene || !spotProductId) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      const nextHotspots = [
        ...(roomScene.hotspots || []),
        { _key: `spot_${Date.now()}`, productId: spotProductId, x, y },
      ];
      setRoomScene({ ...roomScene, hotspots: nextHotspots });
      try {
        await client.createOrReplace({
          _id: roomScene._id || 'roomScene.primary',
          _type: 'roomScene',
          title: roomScene.title || '',
          eyebrow: roomScene.eyebrow || '',
          ...(roomScene.image ? { image: roomScene.image } : {}),
          hotspots: nextHotspots,
        });
        showToast(`${copy.toastHotspotAdded} (${x}%, ${y}%)`);
      } catch (err: any) {
        showToast(err?.message || 'Error');
      }
    };

    const handleRemoveHotspot = async (key?: string, idx?: number) => {
      if (!roomScene) return;
      const nextHotspots = (roomScene.hotspots || []).filter((h, i) =>
        key ? h._key !== key : i !== idx
      );
      setRoomScene({ ...roomScene, hotspots: nextHotspots });
      await client
        .patch(roomScene._id || 'roomScene.primary')
        .set({ hotspots: nextHotspots })
        .commit();
      showToast(copy.toastHotspotRemoved);
    };

    const roleLabel = (val: string) =>
      copy.roles.find((r) => r.value === val)?.label || val;

    const previewTintHex =
      copy.tints.find((t) => t.value === draft.tint)?.hex || '#ece7df';

    const jumpToProducts = (status: 'all' | 'active' | 'draft' | 'low', cat = 'all') => {
      setStatusFilter(status);
      setCatFilter(cat);
      setTab('products');
    };

    return (
      <div
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{
          minHeight: '100%',
          background: COLORS.canvas,
          color: COLORS.ink,
          fontFamily: isRtl
            ? "'Vazirmatn', 'Noto Sans Arabic', Tahoma, sans-serif"
            : 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          display: 'grid',
          gridTemplateColumns: '236px minmax(0, 1fr)',
        }}
      >
        {/* Left Navigation */}
        <aside
          style={{
            background: COLORS.card,
            borderInlineEnd: `1px solid ${COLORS.line}`,
            padding: '20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: COLORS.accent,
                  display: 'inline-block',
                }}
              />
              <strong style={{ fontSize: 15, letterSpacing: '-0.02em' }}>{copy.brandName}</strong>
            </div>
            <span style={{ fontSize: 11, color: COLORS.inkFaint, fontWeight: 500 }}>
              {copy.studioTag}
            </span>
          </div>

          {/* Language Switch */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
              padding: 4,
              borderRadius: 12,
              border: `1px solid ${COLORS.line}`,
              background: COLORS.canvas,
            }}
          >
            <button
              type="button"
              onClick={() => switchLang('ckb')}
              style={{
                border: 'none',
                borderRadius: 8,
                padding: '7px 8px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: lang === 'ckb' ? COLORS.ink : 'transparent',
                color: lang === 'ckb' ? COLORS.card : COLORS.inkSoft,
              }}
            >
              {copy.langKurdishBtn}
            </button>
            <button
              type="button"
              onClick={() => switchLang('en')}
              style={{
                border: 'none',
                borderRadius: 8,
                padding: '7px 8px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: lang === 'en' ? COLORS.ink : 'transparent',
                color: lang === 'en' ? COLORS.card : COLORS.inkSoft,
              }}
            >
              {copy.langEnglishBtn}
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 11, color: COLORS.inkFaint, padding: '4px 10px', fontWeight: 600 }}>
              {copy.workspaceLabel}
            </div>
            {(
              [
                ['overview', copy.navOverview, undefined],
                ['products', copy.navProducts, stats.total],
                ['collections', copy.navCollections, stats.collections],
                ['room', copy.navRoom, roomScene?.hotspots?.length || 0],
                ['team', copy.navTeam, team.length + (currentUser ? 1 : 0)],
              ] as Array<[TabView, string, number | undefined]>
            ).map(([id, label, count]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 11,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    background: active ? COLORS.ink : 'transparent',
                    color: active ? COLORS.card : COLORS.inkSoft,
                    textAlign: isRtl ? 'right' : 'left',
                  }}
                >
                  <span>{label}</span>
                  {count !== undefined && (
                    <span style={{ fontSize: 11, opacity: active ? 0.8 : 0.65 }}>{count}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Compact Cloud Card */}
          <div
            style={{
              marginTop: 'auto',
              border: `1px solid ${COLORS.line}`,
              background: COLORS.canvas,
              borderRadius: 14,
              padding: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>
                {copy.sanityCloud}
              </span>
              <button
                type="button"
                onClick={loadAll}
                style={{
                  border: `1px solid ${COLORS.line}`,
                  background: COLORS.card,
                  borderRadius: 8,
                  padding: '4px 9px',
                  fontSize: 11,
                  cursor: 'pointer',
                  color: COLORS.inkSoft,
                }}
              >
                {copy.syncBtn}
              </button>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: COLORS.inkSoft }}>
              {stats.sanityPublished} {copy.publishedUnit} {'\u00B7'}{' '}
              {client.config().projectId || 'yx4kz08m'}/{client.config().dataset || 'production'}
            </div>
            {stats.sanityDrafts > 0 && (
              <div style={{ marginTop: 4, fontSize: 11, color: COLORS.warn, fontWeight: 600 }}>
                {stats.sanityDrafts} {copy.unpublishedBadge}
              </div>
            )}
            {currentUser && (
              <div style={{ marginTop: 4, fontSize: 11, color: COLORS.inkFaint }}>
                {copy.signedIn}: {currentUser.name}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ padding: '24px 28px', minWidth: 0, maxWidth: 1320 }}>
          {/* Clean Top Bar */}
          <header
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              paddingBottom: 18,
              marginBottom: 22,
              borderBottom: `1px solid ${COLORS.line}`,
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
                {tab === 'overview' && copy.titleOverview}
                {tab === 'products' && copy.titleProducts}
                {tab === 'collections' && copy.titleCollections}
                {tab === 'room' && copy.titleRoom}
                {tab === 'team' && copy.titleTeam}
              </h1>
              <div style={{ marginTop: 4, fontSize: 13, color: COLORS.inkSoft }}>
                {tab === 'overview' && copy.subtitleOverview}
                {tab === 'products' && copy.subtitleProducts}
                {tab === 'collections' && copy.subtitleCollections}
                {tab === 'room' && copy.subtitleRoom}
                {tab === 'team' && copy.subtitleTeam}
              </div>
            </div>

            <button
              type="button"
              onClick={openNewPiece}
              style={{
                background: COLORS.ink,
                color: COLORS.card,
                border: 'none',
                borderRadius: 12,
                padding: '11px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {copy.newPieceBtn}
            </button>
          </header>

          {!loading && stats.sanityDrafts > 0 && (
            <div
              style={{
                marginBottom: 18,
                padding: '12px 16px',
                borderRadius: 14,
                border: `1px solid ${COLORS.warn}`,
                background: COLORS.warnSoft,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 13, color: COLORS.ink, fontWeight: 500 }}>
                <strong>
                  {stats.sanityDrafts} {copy.unpublishedBadge}
                </strong>{' '}
                {'\u00B7'} {copy.publishAllHint}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={handlePublishAllDrafts}
                style={{
                  border: 'none',
                  background: COLORS.ink,
                  color: COLORS.card,
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {saving ? copy.savingBtn : `${copy.publishAllBtn} (${stats.sanityDrafts})`}
              </button>
            </div>
          )}

          {loading ? (
            <div
              style={{
                border: `1px solid ${COLORS.line}`,
                background: COLORS.card,
                borderRadius: 16,
                padding: 40,
                textAlign: 'center',
                color: COLORS.inkSoft,
                fontSize: 14,
              }}
            >
              {copy.loadingCatalog}
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Clickable KPI Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                      gap: 14,
                    }}
                  >
                    {[
                      {
                        title: copy.kpiLive,
                        value: stats.live,
                        sub: `${copy.kpiLiveSub} ${stats.totalStock}`,
                        color: COLORS.ok,
                        onClick: () => jumpToProducts('active'),
                      },
                      {
                        title: copy.kpiLow,
                        value: stats.lowStock,
                        sub: copy.kpiLowSub,
                        color: COLORS.warn,
                        onClick: () => jumpToProducts('low'),
                      },
                      {
                        title: copy.kpiCollections,
                        value: stats.collections,
                        sub: copy.kpiCollectionsSub,
                        color: COLORS.accent,
                        onClick: () => setTab('collections'),
                      },
                      {
                        title: copy.kpiDrafts,
                        value: stats.drafts,
                        sub: copy.kpiDraftsSub,
                        color: COLORS.inkSoft,
                        onClick: () => jumpToProducts('draft'),
                      },
                    ].map((card) => (
                      <button
                        key={card.title}
                        type="button"
                        onClick={card.onClick}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.card,
                          borderRadius: 16,
                          padding: 18,
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 500 }}>
                          {card.title}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 28,
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                            color: COLORS.ink,
                          }}
                        >
                          {card.value}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 11, color: card.color, fontWeight: 500 }}>
                          {card.sub}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Quick Actions Strip */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 14,
                    }}
                  >
                    {[
                      {
                        title: copy.qaAddTitle,
                        sub: copy.qaAddSub,
                        tint: COLORS.accentSoft,
                        accent: COLORS.accent,
                        onClick: openNewPiece,
                      },
                      {
                        title: copy.qaLowTitle,
                        sub: copy.qaLowSub,
                        tint: COLORS.warnSoft,
                        accent: COLORS.warn,
                        onClick: () => jumpToProducts('low'),
                      },
                      {
                        title: copy.qaRoomTitle,
                        sub: copy.qaRoomSub,
                        tint: COLORS.okSoft,
                        accent: COLORS.ok,
                        onClick: () => setTab('room'),
                      },
                    ].map((qa) => (
                      <button
                        key={qa.title}
                        type="button"
                        onClick={qa.onClick}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.card,
                          borderRadius: 14,
                          padding: '14px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          textAlign: isRtl ? 'right' : 'left',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>
                            {qa.title}
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 3 }}>
                            {qa.sub}
                          </div>
                        </div>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: qa.tint,
                            color: qa.accent,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {'\u2197'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Priority Table & Clickable Collections */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.65fr) minmax(260px, 1fr)',
                      gap: 18,
                    }}
                  >
                    <div
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.card,
                        borderRadius: 16,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          padding: '15px 18px',
                          borderBottom: `1px solid ${COLORS.line}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <strong style={{ fontSize: 14 }}>{copy.priorityInventory}</strong>
                        <button
                          type="button"
                          onClick={() => jumpToProducts('all')}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: COLORS.accent,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {copy.openAll}
                        </button>
                      </div>
                      <div>
                        {priorityRows.map((p) => (
                          <div
                            key={p._id}
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '11px 18px',
                              borderBottom: `1px solid ${COLORS.line}`,
                              gap: 12,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 10,
                                  background: COLORS.canvas,
                                  border: `1px solid ${COLORS.line}`,
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                }}
                              >
                                {p.imageUrl && (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: COLORS.inkSoft }}>
                                  {catLabel(p.category)} {'\u00B7'} ${p.price}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  border: `1px solid ${COLORS.line}`,
                                  borderRadius: 8,
                                  background: COLORS.canvas,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleStepStock(p, -1)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '4px 9px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  {'\u2212'}
                                </button>
                                <span
                                  style={{
                                    fontSize: 12,
                                    padding: '0 6px',
                                    fontWeight: 600,
                                    color: (p.stock ?? 0) <= 3 ? COLORS.warn : COLORS.ink,
                                  }}
                                >
                                  {p.stock ?? 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStepStock(p, 1)}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '4px 9px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleToggleStatus(p)}
                                style={{
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '5px 10px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  background: p.status === 'draft' ? COLORS.warnSoft : COLORS.okSoft,
                                  color: p.status === 'draft' ? COLORS.warn : COLORS.ok,
                                }}
                              >
                                {p.status === 'draft' ? copy.draftLabel : copy.liveLabel}
                              </button>

                              <button
                                type="button"
                                onClick={() => loadProductIntoDraft(p, false)}
                                style={{
                                  border: `1px solid ${COLORS.line}`,
                                  background: COLORS.card,
                                  borderRadius: 8,
                                  padding: '5px 11px',
                                  fontSize: 12,
                                  cursor: 'pointer',
                                }}
                              >
                                {copy.editBtn}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.card,
                        borderRadius: 16,
                        padding: 18,
                        alignSelf: 'start',
                      }}
                    >
                      <strong style={{ fontSize: 14 }}>{copy.collectionBalance}</strong>
                      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {categoryBreakdown.map((seg) => (
                          <button
                            key={seg.id}
                            type="button"
                            onClick={() => jumpToProducts('all', seg.id)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              padding: 0,
                              cursor: 'pointer',
                              textAlign: isRtl ? 'right' : 'left',
                              width: '100%',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 12,
                                marginBottom: 5,
                              }}
                            >
                              <span style={{ fontWeight: 500, color: COLORS.ink }}>{seg.label}</span>
                              <span style={{ color: COLORS.inkSoft }}>
                                {seg.count} ({seg.pct}%)
                              </span>
                            </div>
                            <div
                              style={{
                                height: 7,
                                borderRadius: 999,
                                background: COLORS.canvas,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${seg.pct}%`,
                                  background: COLORS.accent,
                                  borderRadius: 999,
                                }}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS */}
              {tab === 'products' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      border: `1px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(
                        [
                          ['all', `${copy.filterAll} (${products.length})`],
                          ['active', `${copy.filterLive} (${stats.live})`],
                          ['draft', `${copy.filterDraft} (${stats.drafts})`],
                          ['low', `${copy.filterLow} (${stats.lowStock})`],
                        ] as const
                      ).map(([k, lbl]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setStatusFilter(k)}
                          style={{
                            border: `1px solid ${statusFilter === k ? COLORS.ink : COLORS.line}`,
                            background: statusFilter === k ? COLORS.ink : COLORS.canvas,
                            color: statusFilter === k ? COLORS.card : COLORS.inkSoft,
                            borderRadius: 10,
                            padding: '7px 12px',
                            fontSize: 12,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                      <select
                        value={catFilter}
                        onChange={(e) => setCatFilter(e.target.value)}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          background: COLORS.canvas,
                        }}
                      >
                        <option value="all">{copy.allCollections}</option>
                        {categoryOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={copy.searchPlaceholder}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          background: COLORS.canvas,
                          width: 180,
                        }}
                      />

                      <div
                        style={{
                          display: 'inline-flex',
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: 2,
                          background: COLORS.canvas,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setViewMode('table')}
                          style={{
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 12,
                            cursor: 'pointer',
                            background: viewMode === 'table' ? COLORS.card : 'transparent',
                            fontWeight: viewMode === 'table' ? 600 : 400,
                          }}
                        >
                          {copy.tableView}
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          style={{
                            border: 'none',
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 12,
                            cursor: 'pointer',
                            background: viewMode === 'grid' ? COLORS.card : 'transparent',
                            fontWeight: viewMode === 'grid' ? 600 : 400,
                          }}
                        >
                          {copy.gridView}
                        </button>
                      </div>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.card,
                        borderRadius: 16,
                        padding: 40,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{copy.emptyTitle}</div>
                      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 6 }}>
                        {copy.emptyHint}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('all');
                          setCatFilter('all');
                          setSearch('');
                        }}
                        style={{
                          marginTop: 14,
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.canvas,
                          borderRadius: 10,
                          padding: '8px 14px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copy.resetFiltersBtn}
                      </button>
                    </div>
                  ) : viewMode === 'table' ? (
                    <div
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.card,
                        borderRadius: 16,
                        overflow: 'hidden',
                      }}
                    >
                      {filteredProducts.map((p) => (
                        <div
                          key={p._id}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 18px',
                            borderBottom: `1px solid ${COLORS.line}`,
                            gap: 12,
                            fontSize: 13,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220, flex: 1 }}>
                            <div
                              style={{
                                width: 46,
                                height: 46,
                                borderRadius: 10,
                                background: COLORS.canvas,
                                border: `1px solid ${COLORS.line}`,
                                overflow: 'hidden',
                                flexShrink: 0,
                              }}
                            >
                              {p.imageUrl && (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>
                                {catLabel(p.category)} {'\u00B7'} ${p.price}
                                {Array.isArray(p.frames360) && p.frames360.length > 0 ? ' \u00B7 360\u00B0' : ''}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                border: `1px solid ${COLORS.line}`,
                                borderRadius: 8,
                                background: COLORS.canvas,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleStepStock(p, -1)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                {'\u2212'}
                              </button>
                              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>
                                {p.stock ?? 0}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStepStock(p, 1)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                }}
                              >
                                +
                              </button>
                            </div>

                            {p.isSanityDraft && (
                              <button
                                type="button"
                                onClick={() => handlePublishDraftRow(p)}
                                style={{
                                  border: 'none',
                                  borderRadius: 8,
                                  padding: '6px 10px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  background: COLORS.accentSoft,
                                  color: COLORS.accent,
                                }}
                              >
                                {copy.publishNowBtn}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              style={{
                                border: 'none',
                                borderRadius: 8,
                                padding: '6px 10px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: p.status === 'draft' ? COLORS.warnSoft : COLORS.okSoft,
                                color: p.status === 'draft' ? COLORS.warn : COLORS.ok,
                              }}
                            >
                              {p.status === 'draft' ? copy.draftLabel : copy.liveLabel}
                            </button>

                            <button
                              type="button"
                              onClick={() => loadProductIntoDraft(p, true)}
                              style={{
                                border: `1px solid ${COLORS.line}`,
                                background: COLORS.canvas,
                                borderRadius: 8,
                                padding: '6px 10px',
                                fontSize: 12,
                                color: COLORS.inkSoft,
                                cursor: 'pointer',
                              }}
                            >
                              {copy.duplicateBtn}
                            </button>

                            <button
                              type="button"
                              onClick={() => loadProductIntoDraft(p, false)}
                              style={{
                                border: `1px solid ${COLORS.line}`,
                                background: COLORS.card,
                                borderRadius: 8,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {copy.editBtn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: 14,
                      }}
                    >
                      {filteredProducts.map((p) => (
                        <div
                          key={p._id}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            background: COLORS.card,
                            borderRadius: 16,
                            padding: 14,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              aspectRatio: '4 / 3',
                              borderRadius: 12,
                              background: COLORS.canvas,
                              overflow: 'hidden',
                            }}
                          >
                            {p.imageUrl && (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: COLORS.inkSoft }}>
                            <span>${p.price}</span>
                            <span>
                              {copy.stockLabel}: {p.stock ?? 0}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => loadProductIntoDraft(p, false)}
                              style={{
                                border: `1px solid ${COLORS.line}`,
                                background: COLORS.canvas,
                                borderRadius: 10,
                                padding: '8px 10px',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {copy.editPieceBtn}
                            </button>
                            <button
                              type="button"
                              onClick={() => loadProductIntoDraft(p, true)}
                              style={{
                                border: `1px solid ${COLORS.line}`,
                                background: COLORS.card,
                                borderRadius: 10,
                                padding: '8px 10px',
                                fontSize: 12,
                                cursor: 'pointer',
                                color: COLORS.inkSoft,
                              }}
                            >
                              {copy.duplicateBtn}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COLLECTIONS */}
              {tab === 'collections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div
                    style={{
                      border: `1px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 16,
                      padding: 16,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 10,
                      alignItems: 'center',
                    }}
                  >
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder={copy.newCollectionPlaceholder}
                      style={{
                        flex: 1,
                        minWidth: 220,
                        border: `1px solid ${COLORS.line}`,
                        borderRadius: 10,
                        padding: '10px 14px',
                        fontSize: 13,
                        background: COLORS.canvas,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={saving}
                      style={{
                        border: 'none',
                        background: COLORS.ink,
                        color: COLORS.card,
                        borderRadius: 10,
                        padding: '10px 18px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copy.addCollectionBtn}
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: 14,
                    }}
                  >
                    {categoryOptions.map((c) => {
                      const count = products.filter((p) => p.category === c.id).length;
                      const doc = categories.find(
                        (row) => (row.slug?.current || slugify(row.name)) === c.id
                      );
                      return (
                        <div
                          key={c.id}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            background: COLORS.card,
                            borderRadius: 16,
                            padding: 18,
                          }}
                        >
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{c.label}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: COLORS.inkSoft }}>
                            {count} {copy.pcsUnit} {'\u00B7'} {c.id}
                          </div>
                          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => jumpToProducts('all', c.id)}
                              style={{
                                border: `1px solid ${COLORS.line}`,
                                background: COLORS.canvas,
                                borderRadius: 8,
                                padding: '6px 12px',
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              {copy.viewPiecesBtn}
                            </button>
                            {doc &&
                              (confirmDeleteId === doc._id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(doc)}
                                    style={{
                                      border: 'none',
                                      background: COLORS.danger,
                                      color: '#fff',
                                      borderRadius: 8,
                                      padding: '6px 10px',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {copy.confirmDeleteBtn}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    style={{
                                      border: `1px solid ${COLORS.line}`,
                                      background: COLORS.card,
                                      borderRadius: 8,
                                      padding: '6px 10px',
                                      fontSize: 11,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    {copy.cancelTinyBtn}
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(doc._id)}
                                  style={{
                                    border: 'none',
                                    background: COLORS.dangerSoft,
                                    color: COLORS.danger,
                                    borderRadius: 8,
                                    padding: '6px 12px',
                                    fontSize: 12,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {copy.deleteBtn}
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ROOM HOTSPOTS */}
              {tab === 'room' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div
                    style={{
                      border: `1px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 16,
                      padding: 16,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{copy.roomHint}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                      <select
                        value={spotProductId}
                        onChange={(e) => setSpotProductId(e.target.value)}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          background: COLORS.canvas,
                        }}
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p.slug?.current || p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <label
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.canvas,
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {uploadingField === 'room' ? copy.uploading : copy.roomUploadLabel}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadRoomPhoto}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  {roomScene?.imageUrl ? (
                    <>
                      <div
                        onClick={handleRoomClick}
                        style={{
                          position: 'relative',
                          borderRadius: 18,
                          overflow: 'hidden',
                          border: `1px solid ${COLORS.line}`,
                          cursor: 'crosshair',
                        }}
                      >
                        <img
                          src={roomScene.imageUrl}
                          alt="Room"
                          style={{ width: '100%', display: 'block', maxHeight: 520, objectFit: 'cover' }}
                        />
                        {(roomScene.hotspots || []).map((spot, idx) => (
                          <button
                            key={spot._key || idx}
                            type="button"
                            title={spot.productId}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleRemoveHotspot(spot._key, idx);
                            }}
                            style={{
                              position: 'absolute',
                              left: `${spot.x}%`,
                              top: `${spot.y}%`,
                              transform: 'translate(-50%, -50%)',
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              border: '2px solid #ffffff',
                              background: COLORS.accent,
                              color: '#ffffff',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {'\u00D7'}
                          </button>
                        ))}
                      </div>

                      <div
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.card,
                          borderRadius: 16,
                          padding: 16,
                        }}
                      >
                        <strong style={{ fontSize: 13 }}>{copy.roomPinsTitle}</strong>
                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {(roomScene.hotspots || []).length === 0 ? (
                            <span style={{ fontSize: 12, color: COLORS.inkSoft }}>{copy.roomNoPins}</span>
                          ) : (
                            (roomScene.hotspots || []).map((spot, idx) => {
                              const match = products.find(
                                (p) => (p.slug?.current || p._id) === spot.productId
                              );
                              return (
                                <span
                                  key={spot._key || idx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    border: `1px solid ${COLORS.line}`,
                                    background: COLORS.canvas,
                                    borderRadius: 10,
                                    padding: '6px 10px',
                                    fontSize: 12,
                                  }}
                                >
                                  <span>{match?.name || spot.productId}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveHotspot(spot._key, idx)}
                                    style={{
                                      border: 'none',
                                      background: 'transparent',
                                      color: COLORS.danger,
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {'\u00D7'}
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.card,
                        borderRadius: 16,
                        padding: 36,
                        textAlign: 'center',
                        color: COLORS.inkSoft,
                        fontSize: 13,
                      }}
                    >
                      {copy.noRoomMsg}
                    </div>
                  )}
                </div>
              )}

              {/* TEAM */}
              {tab === 'team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div
                    style={{
                      border: `1px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 16,
                      padding: 20,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: COLORS.inkFaint, fontWeight: 600 }}>
                        {copy.activeAccount}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}>
                        {currentUser?.name || copy.studioOwner}
                      </div>
                      <div style={{ marginTop: 2, fontSize: 12, color: COLORS.inkSoft }}>
                        {currentUser?.email || 'Sanity'} {'\u00B7'} {copy.projectLabel}: yx4kz08m
                      </div>
                    </div>
                    <a
                      href="https://www.sanity.io/manage/project/yx4kz08m/members"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: COLORS.ink,
                        color: COLORS.card,
                        textDecoration: 'none',
                        borderRadius: 10,
                        padding: '10px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {copy.manageMembersBtn} {'\u2197'}
                    </a>
                  </div>

                  <div
                    style={{
                      border: `1px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <strong style={{ fontSize: 14 }}>{copy.teamDirectory}</strong>
                    <div
                      style={{
                        marginTop: 14,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 10,
                      }}
                    >
                      <input
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder={copy.fullNamePh}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '9px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      />
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '9px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      >
                        {copy.roles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder={copy.emailPh}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '9px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      />
                      <input
                        value={newMember.location}
                        onChange={(e) => setNewMember({ ...newMember, location: e.target.value })}
                        placeholder={copy.branchPh}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '9px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTeamMember}
                        disabled={saving}
                        style={{
                          border: 'none',
                          background: COLORS.ink,
                          color: COLORS.card,
                          borderRadius: 10,
                          padding: '9px 16px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copy.addMemberBtn}
                      </button>
                    </div>

                    <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {team.length === 0 ? (
                        <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{copy.noTeamYet}</div>
                      ) : (
                        team.map((m) => (
                          <div
                            key={m._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: `1px solid ${COLORS.line}`,
                              background: COLORS.canvas,
                              borderRadius: 12,
                              padding: '12px 16px',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                              <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                                {roleLabel(m.role)} {'\u00B7'} {m.location || copy.defaultBranch}
                                {m.email ? ` \u00B7 ${m.email}` : ''}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(m._id)}
                              style={{
                                border: 'none',
                                background: COLORS.dangerSoft,
                                color: COLORS.danger,
                                borderRadius: 8,
                                padding: '6px 10px',
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              {copy.removeBtn}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* SLIDE-OVER 3-STEP PRODUCT DRAWER */}
        {drawerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(24, 23, 21, 0.35)',
              display: 'flex',
              justifyContent: isRtl ? 'flex-start' : 'flex-end',
            }}
          >
            <div
              style={{
                width: 'min(640px, 100vw)',
                height: '100%',
                background: COLORS.card,
                borderInlineStart: `1px solid ${COLORS.line}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '16px 22px',
                  borderBottom: `1px solid ${COLORS.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <strong style={{ fontSize: 16 }}>
                    {draft._id
                      ? `${copy.drawerEditPrefix} ${draft.name}`
                      : draft.isDuplicate
                      ? `${copy.drawerCopyTitle} ${draft.name}`
                      : copy.drawerNewTitle}
                  </strong>
                  <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{copy.drawerSubtitle}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    border: `1px solid ${COLORS.line}`,
                    background: COLORS.canvas,
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  {'\u00D7'}
                </button>
              </div>

              {/* Mini Storefront Card Preview */}
              <div
                style={{
                  padding: '12px 22px',
                  borderBottom: `1px solid ${COLORS.line}`,
                  background: COLORS.canvas,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: previewTintHex,
                      border: `1px solid ${COLORS.line}`,
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      color: COLORS.inkFaint,
                    }}
                  >
                    {draft.imageUrl ? (
                      <img
                        src={draft.imageUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      copy.noMainImg
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: COLORS.inkFaint, fontWeight: 600 }}>
                      {copy.previewLabel}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                      {draft.name.trim() || copy.fieldNamePh}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                      {catLabel(draft.category)} {'\u00B7'} ${draft.price || 0} {'\u00B7'} {draft.stock ?? 0}{' '}
                      {copy.pcsUnit}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {draft.finishes.slice(0, 5).map((f, idx) => (
                    <span
                      key={f._key || idx}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        background: f.color,
                        border: `1px solid ${COLORS.line}`,
                        opacity: f.soldOut ? 0.35 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 3 Step Tabs */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 6,
                  padding: '10px 22px',
                  borderBottom: `1px solid ${COLORS.line}`,
                  background: COLORS.card,
                }}
              >
                {(
                  [
                    ['essentials', copy.tabEssentials],
                    ['media', copy.tabMedia],
                    ['finishes', copy.tabFinishes],
                  ] as const
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setEditorTab(k)}
                    style={{
                      border: `1px solid ${editorTab === k ? COLORS.ink : COLORS.line}`,
                      background: editorTab === k ? COLORS.ink : COLORS.canvas,
                      color: editorTab === k ? COLORS.card : COLORS.inkSoft,
                      borderRadius: 10,
                      padding: '8px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {/* Drawer Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {editorTab === 'essentials' && (
                  <>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                      {copy.fieldName}
                      <input
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                        placeholder={copy.fieldNamePh}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldCollection}
                        <select
                          value={draft.category}
                          onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        >
                          {categoryOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldStatus}
                        <select
                          value={draft.status}
                          onChange={(e) =>
                            setDraft({ ...draft, status: e.target.value === 'draft' ? 'draft' : 'active' })
                          }
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        >
                          <option value="active">{copy.statusActiveOpt}</option>
                          <option value="draft">{copy.statusDraftOpt}</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldPrice}
                        <input
                          type="number"
                          value={draft.price}
                          onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldStock}
                        <input
                          type="number"
                          value={draft.stock}
                          onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldBadge}
                        <input
                          value={draft.badge}
                          onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                          placeholder={copy.fieldBadgePh}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        />
                      </label>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                      {copy.fieldBlurb}
                      <textarea
                        rows={3}
                        value={draft.blurb}
                        onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
                        placeholder={copy.fieldBlurbPh}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      />
                    </label>
                  </>
                )}

                {editorTab === 'media' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {/* Main Image Box */}
                      <div
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 14,
                          padding: 14,
                          background: COLORS.canvas,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{copy.fieldMainImg}</div>
                        <div
                          style={{
                            marginTop: 10,
                            height: 140,
                            borderRadius: 10,
                            background: previewTintHex,
                            border: `1px solid ${COLORS.line}`,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: COLORS.inkFaint,
                          }}
                        >
                          {draft.imageUrl ? (
                            <img
                              src={draft.imageUrl}
                              alt="Main"
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            copy.noMainImg
                          )}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label
                            style={{
                              border: 'none',
                              background: COLORS.ink,
                              color: COLORS.card,
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: 11,
                              fontWeight: 600,
                              textAlign: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            {uploadingField === 'image' ? copy.uploading : copy.uploadFileBtn}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadImage('image', e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaLibrary('image')}
                            style={{
                              border: `1px solid ${COLORS.line}`,
                              background: COLORS.card,
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            {copy.pickSanityBtn}
                          </button>
                        </div>
                      </div>

                      {/* Scene Image Box */}
                      <div
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 14,
                          padding: 14,
                          background: COLORS.canvas,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{copy.fieldSceneImg}</div>
                        <div
                          style={{
                            marginTop: 10,
                            height: 140,
                            borderRadius: 10,
                            background: COLORS.card,
                            border: `1px solid ${COLORS.line}`,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: COLORS.inkFaint,
                          }}
                        >
                          {draft.sceneUrl ? (
                            <img
                              src={draft.sceneUrl}
                              alt="Scene"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            copy.noSceneImg
                          )}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label
                            style={{
                              border: 'none',
                              background: COLORS.ink,
                              color: COLORS.card,
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: 11,
                              fontWeight: 600,
                              textAlign: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            {uploadingField === 'scene' ? copy.uploading : copy.uploadFileBtn}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadImage('scene', e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaLibrary('scene')}
                            style={{
                              border: `1px solid ${COLORS.line}`,
                              background: COLORS.card,
                              borderRadius: 8,
                              padding: '7px 10px',
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            {copy.pickSanityBtn}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Visual Aura Color Chips */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        {copy.fieldTint}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {copy.tints.map((t) => {
                          const active = draft.tint === t.value;
                          return (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setDraft({ ...draft, tint: t.value })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                border: `1.5px solid ${active ? COLORS.ink : COLORS.line}`,
                                background: active ? COLORS.card : COLORS.canvas,
                                borderRadius: 10,
                                padding: '6px 10px',
                                fontSize: 12,
                                fontWeight: active ? 600 : 400,
                                cursor: 'pointer',
                              }}
                            >
                              <span
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: 999,
                                  background: t.hex,
                                  border: `1px solid ${COLORS.line}`,
                                }}
                              />
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 360 Shape + Frames */}
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                      {copy.field360Shape}
                      <select
                        value={draft.view360Type}
                        onChange={(e) => setDraft({ ...draft, view360Type: e.target.value })}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      >
                        {copy.shapes360.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        borderRadius: 14,
                        padding: 14,
                        background: COLORS.canvas,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>
                            {copy.frames360Title} ({draft.frames360.length})
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 2 }}>
                            {copy.frames360Hint}
                          </div>
                        </div>
                        <label
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            background: COLORS.card,
                            borderRadius: 8,
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {uploadingField === 'frames' ? copy.uploading : copy.add360Btn}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUploadFrames360}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>

                      {draft.frames360.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {draft.frames360.map((fr, idx) => (
                            <div
                              key={fr._key || idx}
                              style={{
                                position: 'relative',
                                width: 54,
                                height: 54,
                                borderRadius: 8,
                                border: `1px solid ${COLORS.line}`,
                                background: COLORS.card,
                                overflow: 'hidden',
                              }}
                            >
                              {fr.url && (
                                <img
                                  src={fr.url}
                                  alt={`Frame ${idx + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    frames360: prev.frames360.filter((_, i) => i !== idx),
                                  }))
                                }
                                style={{
                                  position: 'absolute',
                                  top: 2,
                                  right: 2,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  border: 'none',
                                  background: COLORS.ink,
                                  color: '#fff',
                                  fontSize: 10,
                                  cursor: 'pointer',
                                  lineHeight: '16px',
                                  padding: 0,
                                }}
                              >
                                {'\u00D7'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {editorTab === 'finishes' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldDimensions}
                        <input
                          value={draft.dimensions}
                          onChange={(e) => setDraft({ ...draft, dimensions: e.target.value })}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        />
                      </label>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                        {copy.fieldMaterial}
                        <input
                          value={draft.material}
                          onChange={(e) => setDraft({ ...draft, material: e.target.value })}
                          style={{
                            border: `1px solid ${COLORS.line}`,
                            borderRadius: 10,
                            padding: '10px 12px',
                            fontSize: 13,
                            background: COLORS.canvas,
                          }}
                        />
                      </label>
                    </div>

                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
                        {copy.quickSwatch}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {copy.swatches.map((sw) => (
                          <button
                            key={sw.name}
                            type="button"
                            onClick={() =>
                              setDraft((prev) => ({
                                ...prev,
                                finishes: [
                                  ...prev.finishes,
                                  { _key: `f_${Date.now()}`, name: sw.name, color: sw.color, soldOut: false },
                                ],
                              }))
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              border: `1px solid ${COLORS.line}`,
                              background: COLORS.canvas,
                              borderRadius: 999,
                              padding: '5px 10px',
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            <span
                              style={{
                                width: 11,
                                height: 11,
                                borderRadius: 999,
                                background: sw.color,
                                border: `1px solid ${COLORS.line}`,
                              }}
                            />
                            {sw.name}
                          </button>
                        ))}
                      </div>

                      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {draft.finishes.map((f, idx) => (
                          <div
                            key={f._key || idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 8,
                              border: `1px solid ${COLORS.line}`,
                              borderRadius: 10,
                              padding: '8px 10px',
                              background: COLORS.canvas,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input
                                type="color"
                                value={f.color}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    finishes: prev.finishes.map((item, i) =>
                                      i === idx ? { ...item, color: e.target.value } : item
                                    ),
                                  }))
                                }
                              />
                              <input
                                value={f.name}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    finishes: prev.finishes.map((item, i) =>
                                      i === idx ? { ...item, name: e.target.value } : item
                                    ),
                                  }))
                                }
                                style={{
                                  border: `1px solid ${COLORS.line}`,
                                  borderRadius: 6,
                                  padding: '4px 8px',
                                  fontSize: 12,
                                  background: COLORS.card,
                                }}
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    finishes: prev.finishes.map((item, i) =>
                                      i === idx ? { ...item, soldOut: !item.soldOut } : item
                                    ),
                                  }))
                                }
                                style={{
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  background: f.soldOut ? COLORS.dangerSoft : COLORS.okSoft,
                                  color: f.soldOut ? COLORS.danger : COLORS.ok,
                                }}
                              >
                                {f.soldOut ? copy.soldOutLabel : copy.availableLabel}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    finishes: prev.finishes.filter((_, i) => i !== idx),
                                  }))
                                }
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: COLORS.danger,
                                  cursor: 'pointer',
                                  fontSize: 15,
                                }}
                              >
                                {'\u00D7'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600 }}>
                      {copy.highlightsLabel}
                      <textarea
                        rows={3}
                        value={draft.detailsText}
                        onChange={(e) => setDraft({ ...draft, detailsText: e.target.value })}
                        placeholder={copy.highlightsPh}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          fontSize: 13,
                          background: COLORS.canvas,
                        }}
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Drawer Footer with Delete Confirmation & Next Step */}
              <div
                style={{
                  padding: '14px 22px',
                  borderTop: `1px solid ${COLORS.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  background: COLORS.canvas,
                }}
              >
                {draft._id ? (
                  confirmDeleteId === draft._id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const row = products.find((p) => p._id === draft._id);
                          if (row) handleDeleteProduct(row);
                        }}
                        style={{
                          border: 'none',
                          background: COLORS.danger,
                          color: '#fff',
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copy.confirmDeleteBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.card,
                          borderRadius: 10,
                          padding: '8px 10px',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {copy.cancelTinyBtn}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(draft._id)}
                      style={{
                        border: 'none',
                        background: COLORS.dangerSoft,
                        color: COLORS.danger,
                        borderRadius: 10,
                        padding: '9px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copy.deletePieceBtn}
                    </button>
                  )
                ) : (
                  <span />
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      border: `1px solid ${COLORS.line}`,
                      background: COLORS.card,
                      borderRadius: 10,
                      padding: '9px 14px',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {copy.cancelBtn}
                  </button>
                  {editorTab !== 'finishes' && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditorTab(editorTab === 'essentials' ? 'media' : 'finishes')
                      }
                      style={{
                        border: `1px solid ${COLORS.line}`,
                        background: COLORS.card,
                        borderRadius: 10,
                        padding: '9px 14px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {copy.nextTabBtn}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveProduct}
                    style={{
                      border: 'none',
                      background: COLORS.ink,
                      color: COLORS.card,
                      borderRadius: 10,
                      padding: '9px 18px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {saving ? copy.savingBtn : copy.saveSanityBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SANITY MEDIA PICKER MODAL */}
        {mediaPickerTarget && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10001,
              background: 'rgba(24, 23, 21, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <div
              style={{
                width: 'min(640px, 100%)',
                maxHeight: '80vh',
                background: COLORS.card,
                borderRadius: 18,
                border: `1px solid ${COLORS.line}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: `1px solid ${COLORS.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <strong style={{ fontSize: 14 }}>{copy.mediaModalTitle}</strong>
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget(null)}
                  style={{
                    border: `1px solid ${COLORS.line}`,
                    background: COLORS.canvas,
                    borderRadius: 8,
                    width: 28,
                    height: 28,
                    cursor: 'pointer',
                  }}
                >
                  {'\u00D7'}
                </button>
              </div>
              <div style={{ padding: 16, overflowY: 'auto' }}>
                {loadingAssets ? (
                  <div style={{ fontSize: 13, color: COLORS.inkSoft, padding: 20, textAlign: 'center' }}>
                    {copy.loadingCatalog}
                  </div>
                ) : assets.length === 0 ? (
                  <div style={{ fontSize: 13, color: COLORS.inkSoft, padding: 20, textAlign: 'center' }}>
                    {copy.mediaModalEmpty}
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: 10,
                    }}
                  >
                    {assets.map((a) => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => pickSanityAsset(a)}
                        style={{
                          border: `1px solid ${COLORS.line}`,
                          background: COLORS.canvas,
                          borderRadius: 10,
                          padding: 4,
                          cursor: 'pointer',
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={a.url}
                          alt={a.originalFilename || 'Asset'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 7 }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              insetInlineEnd: 20,
              zIndex: 10002,
              background: COLORS.ink,
              color: COLORS.card,
              padding: '10px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 500,
              boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
            }}
          >
            {toast}
          </div>
        )}
      </div>
    );
  };
}

export const kvistDashboardPlugin = definePlugin<Lang | void>((rawLang) => {
  const lang: Lang = rawLang === 'en' ? 'en' : 'ckb';
  return {
    name: `kvist-showroom-dashboard-${lang}`,
    tools: [
      {
        name: 'kvist-studio',
        title: lang === 'ckb' ? '\u0633\u062A\u06C6\u062F\u06CC\u06C6\u06CC \u067E\u06CE\u0634\u0627\u0646\u06AF\u0627' : 'Kvist Studio',
        component: createWorkspaceComponent(lang),
      },
    ],
  };
});
'@

# ---------------------------------------------------------
# 4. sanity.config.ts (2 Pure-Language Workspaces: Kurdish & English)
# ---------------------------------------------------------
Write-Utf8File "sanity.config.ts" @'
import { defineConfig, buildLegacyTheme } from 'sanity';
import { structureTool } from 'sanity/structure';
import { buildSchemaTypes } from './schemaTypes';
import { kvistDashboardPlugin } from './plugins/kvistDashboard';

const kvistTheme = buildLegacyTheme({
  '--black': '#181715',
  '--white': '#faf8f5',
  '--gray': '#6e6a63',
  '--gray-base': '#6e6a63',
  '--component-bg': '#ffffff',
  '--component-text-color': '#181715',
  '--brand-primary': '#b85d3b',
  '--default-button-color': '#6e6a63',
  '--default-button-primary-color': '#181715',
  '--default-button-success-color': '#2f5b44',
  '--default-button-warning-color': '#a6621a',
  '--default-button-danger-color': '#9b3022',
  '--state-info-color': '#2f5b44',
  '--state-success-color': '#2f5b44',
  '--state-warning-color': '#a6621a',
  '--state-danger-color': '#9b3022',
  '--main-navigation-color': '#181715',
  '--main-navigation-color--inverted': '#faf8f5',
  '--focus-color': '#b85d3b',
});

export default defineConfig([
  {
    name: 'ckb',
    title: '\u06A9\u0648\u0631\u062F\u06CC \u00B7 Kvist',
    basePath: '/ckb',
    projectId: 'yx4kz08m',
    dataset: 'production',
    theme: kvistTheme,
    plugins: [
      kvistDashboardPlugin('ckb'),
      structureTool({ title: '\u0628\u06D5\u06B5\u06AF\u06D5\u0646\u0627\u0645\u06D5\u06A9\u0627\u0646' }),
    ],
    schema: {
      types: buildSchemaTypes('ckb'),
    },
  },
  {
    name: 'en',
    title: 'English \u00B7 Kvist',
    basePath: '/en',
    projectId: 'yx4kz08m',
    dataset: 'production',
    theme: kvistTheme,
    plugins: [
      kvistDashboardPlugin('en'),
      structureTool({ title: 'Structure' }),
    ],
    schema: {
      types: buildSchemaTypes('en'),
    },
  },
]);
'@

Write-Host ""
Write-Host "Kvist Studio (Clean & Easy Kurdish / English) installed in D:\test successfully." -ForegroundColor Green
Write-Host "Next step: run 'npx sanity deploy' in this folder." -ForegroundColor Cyan
