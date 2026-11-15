export const roomSceneSchema = {
  name: 'roomScene',
  title: 'Shoppable Room Vignette',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Headline Override (Optional)',
      type: 'string',
      description: 'Leave blank to use default localized headline (e.g. Proportioned for quiet rooms.)',
    },
    {
      name: 'eyebrow',
      title: 'Eyebrow Label Override (Optional)',
      type: 'string',
      description: 'Leave blank to use default localized eyebrow (e.g. Showroom Vignette · Living Space)',
    },
    {
      name: 'image',
      title: 'Room Photograph',
      type: 'image',
      options: { hotspot: true },
      description: 'Wide living space or showroom interior photo (16:10 or 3:2 ratio recommended)',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'hotspots',
      title: 'Interactive Product Dots (Hotspots)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'product',
              title: 'Linked Product Reference (Optional)',
              type: 'reference',
              to: [{ type: 'product' }],
            },
            {
              name: 'productId',
              title: 'Product Slug / ID (e.g. bolle-lounge-chair)',
              type: 'string',
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'x',
              title: 'Horizontal Position X% (0 = Left, 100 = Right)',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(0).max(100),
            },
            {
              name: 'y',
              title: 'Vertical Position Y% (0 = Top, 100 = Bottom)',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(0).max(100),
            },
          ],
          preview: {
            select: {
              productId: 'productId',
              x: 'x',
              y: 'y',
            },
            prepare({ productId, x, y }: any) {
              return {
                title: productId || 'Product Pin',
                subtitle: `Position: X ${x ?? 50}% · Y ${y ?? 50}%`,
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      hotspots: 'hotspots',
    },
    prepare({ title, media, hotspots }: any) {
      return {
        title: title || 'Shoppable Room Vignette',
        subtitle: `${Array.isArray(hotspots) ? hotspots.length : 0} interactive dots`,
        media,
      };
    },
  },
};
