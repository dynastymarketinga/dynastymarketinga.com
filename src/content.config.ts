import { defineCollection, z } from 'astro:content';

const cases = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    featured: z.boolean().optional(),
    title: z.string(),
    category: z.string(),
    categoryLabel: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    cardImage: z.string().optional(),
    video: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    externalUrl: z.string().optional(),
    placeholder: z.boolean().optional(),
  }),
});

export const collections = { cases };
