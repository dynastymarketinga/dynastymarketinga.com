import { defineCollection, z } from 'astro:content';

const imageSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
});

const introSchema = z.object({
  logo: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  descriptionExtra: z.string().optional(),
  credit: z.string().optional(),
});

const sectionSchema = z.object({
  type: z.enum(['full', 'wide', 'media', 'split', 'trio', 'gallery-three']),
  variant: z.enum(['default', 'beu-lifestyle', 'beu-split-print', 'beu-split-notebooks']).optional(),
  splitRatio: z.enum(['8-4', '7-5', '3']).optional(),
  images: z.array(imageSchema).min(1).max(3),
});

const cases = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    order: z.number(),
    published: z.boolean().default(true),
    title: z.string(),
    category: z.string(),
    categoryLabel: z.string(),
    cardImage: z.string().optional(),
    intro: introSchema.optional(),
    sections: z.array(sectionSchema).optional(),
    gallery: z.array(z.string()).optional(),
    themeClass: z.string().optional(),
    demoUrl: z.string().optional(),
    tags: z.array(z.string()).optional(),
    video: z.string().optional(),
    externalUrl: z.string().optional(),
    placeholder: z.boolean().optional(),
  }),
});

export const collections = { cases };
