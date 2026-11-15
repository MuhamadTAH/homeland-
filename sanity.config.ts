/**
 * Sanity Studio Configuration File
 * Used when running Sanity Studio locally or deploying to sanity.io
 */
import { schemaTypes } from './sanity/schemas';

const sanityConfig = {
  name: 'default',
  title: 'Kvist Architectural Furniture Studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  schema: {
    types: schemaTypes,
  },
};

export default sanityConfig;
