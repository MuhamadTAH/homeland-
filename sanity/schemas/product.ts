export const productSchema = {
  name: 'product',
  title: 'Architectural Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      description: 'The title of the piece (e.g. Böllé Lounge Chair)',
      validation: (Rule: any) => Rule.required().max(120),
    },
    {
      name: 'slug',
      title: 'Slug (URL Identifier)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Must match storefront category ID: seating, lighting, tables, textiles, ceramics (or custom slug)',
      options: {
        list: [
          { title: 'Sofas & Chairs (قەنەفە و کورسی)', value: 'seating' },
          { title: 'Lamps & Lights (گڵۆپ و چرا)', value: 'lighting' },
          { title: 'Tables (مێز)', value: 'tables' },
          { title: 'Textiles & Cushions (قوماش و سەرین)', value: 'textiles' },
          { title: 'Vases & Ceramics (سیرامیک و گوڵدان)', value: 'ceramics' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price ($ USD)',
      type: 'number',
      description: 'Showroom price in USD',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'status',
      title: 'Catalog Status',
      type: 'string',
      options: {
        list: [
          { title: 'Active (Live on website)', value: 'active' },
          { title: 'Draft (Showroom preview)', value: 'draft' },
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'stock',
      title: 'Showroom Stock / Display Count',
      type: 'number',
      description: 'Pieces available or on display in Sulaymaniyah showroom',
      initialValue: 8,
    },
    {
      name: 'badge',
      title: 'Badge / Highlight Label',
      type: 'string',
      description: 'e.g. "Heirloom piece", "New arrival", "Sulaymaniyah exclusive"',
    },
    {
      name: 'blurb',
      title: 'Editorial Blurb / Overview',
      type: 'text',
      rows: 3,
      description: 'The architectural description of the piece',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'image',
      title: 'Main Product Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Clean studio cut-out or photograph',
    },
    {
      name: 'scene',
      title: 'Room / Lifestyle Scene Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'In-situ architectural room setting photograph',
    },
    {
      name: 'tint',
      title: 'Background Aura Tint',
      type: 'string',
      options: {
        list: [
          { title: 'Stone (Warm mineral)', value: 'stone' },
          { title: 'Sand (Sunlit beach)', value: 'sand' },
          { title: 'Sage (Soft olive)', value: 'sage' },
          { title: 'Butter (Warm ivory)', value: 'butter' },
          { title: 'Blush (Terracotta)', value: 'blush' },
          { title: 'Sky (Nordic grey-blue)', value: 'sky' },
        ],
      },
      initialValue: 'stone',
    },
    {
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g. "W 82 × D 86 × H 74 cm"',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'material',
      title: 'Primary Material',
      type: 'string',
      description: 'e.g. "100% FSC® Solid European Oak & Belgian Bouclé"',
    },
    {
      name: 'weight',
      title: 'Weight',
      type: 'string',
      description: 'e.g. "18.5 kg"',
    },
    {
      name: 'warranty',
      title: 'Warranty',
      type: 'string',
      description: 'e.g. "10-Year Structural Frame Warranty"',
    },
    {
      name: 'leadTime',
      title: 'Showroom Availability & Delivery',
      type: 'string',
      description: 'e.g. "On display in Sulaymaniyah Showroom · Free delivery"',
    },
    {
      name: 'finishes',
      title: 'Material Finishes & Color Swatches',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Finish Name (e.g. Natural Oak, Bouclé White, Smoked Walnut)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'color',
              title: 'Color Hex Code (e.g. #d8c4a4)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'soldOut',
              title: 'Sold Out in This Color?',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'stock',
              title: 'Available Count in This Color (Optional)',
              type: 'number',
            },
          ],
        },
      ],
    },
    {
      name: 'details',
      title: 'Key Construction & Feature Highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Bullet points (e.g. "FSC® European solid oak frame", "Mortise and tenon joinery")',
    },
    {
      name: 'specifications',
      title: 'Custom Specification Rows (Label + Value)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Specification Label (e.g. Seat Height, Workshop Origin)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'value',
              title: 'Specification Value (e.g. 40 cm)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
          ],
        },
      ],
    },
    {
      name: 'care',
      title: 'Care & Maintenance Guide',
      type: 'text',
      rows: 2,
      description: 'e.g. "Wipe clean with a damp lint-free cloth. Recondition timber annually with natural beeswax."',
    },
    {
      name: 'view360Type',
      title: '360° Turntable 3D Model Shape',
      type: 'string',
      options: {
        list: [
          { title: 'Lounge Chair / Sofa', value: 'chair' },
          { title: 'Table / Desk', value: 'table' },
          { title: 'Lamp / Lighting', value: 'lamp' },
          { title: 'Vase / Object / Textile', value: 'vase' },
        ],
      },
      initialValue: 'chair',
      description: 'Which 3D procedural shape to render in the interactive 360 viewer when photo sequence is not uploaded',
    },
    {
      name: 'frames360',
      title: '360° Multi-Angle Photos (Ordered Sequence)',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
      description: 'Upload 8–36 photos captured around the product in clockwise order to build an interactive photo-based 360° spin view.',
    },
    {
      name: 'position',
      title: 'Display Position / Order',
      type: 'number',
      initialValue: 1,
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
        title,
        subtitle: `${subtitle} · $${price || 0}`,
        media,
      };
    },
  },
};
