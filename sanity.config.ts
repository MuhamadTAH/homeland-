/**
 * Sanity Studio Configuration File
 * Used when running Sanity Studio locally or deploying to sanity.io
 */
import { schemaTypes } from './sanity/schemas';

const rawSanityProjectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim();
const safeProjectId = /^[a-z0-9-]+$/.test(rawSanityProjectId) ? rawSanityProjectId : 'demo';

const sanityConfig = {
  name: 'default',
  title: 'Kvist Architectural Furniture Studio',
  projectId: safeProjectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  schema: {
    types: schemaTypes,
  },
};

export default sanityConfig;
