import { z } from "zod/v4";

export const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  content: z.string(),
});

export const headingBlockSchema = z.object({
  type: z.literal("heading"),
  level: z.number().int().min(1).max(6),
  content: z.string(),
});

export const imageBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().default(""),
  caption: z.string().optional(),
  position: z.enum(["full", "left", "right", "inline"]).default("full"),
});

export const adBlockSchema = z.object({
  type: z.literal("ad"),
  provider: z.string(),
  slot: z.string().optional(),
  format: z.enum(["in-article", "display", "in-feed"]).default("in-article"),
});

export const quoteBlockSchema = z.object({
  type: z.literal("quote"),
  content: z.string(),
  author: z.string().optional(),
});

export const codeBlockSchema = z.object({
  type: z.literal("code"),
  language: z.string().default("text"),
  content: z.string(),
});

export const listBlockSchema = z.object({
  type: z.literal("list"),
  style: z.enum(["ordered", "unordered"]).default("unordered"),
  items: z.array(z.string()),
});

export const dividerBlockSchema = z.object({
  type: z.literal("divider"),
});

export const blockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  imageBlockSchema,
  adBlockSchema,
  quoteBlockSchema,
  codeBlockSchema,
  listBlockSchema,
  dividerBlockSchema,
]);

export type Block = z.infer<typeof blockSchema>;
export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;
export type HeadingBlock = z.infer<typeof headingBlockSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type AdBlock = z.infer<typeof adBlockSchema>;
export type QuoteBlock = z.infer<typeof quoteBlockSchema>;
export type CodeBlock = z.infer<typeof codeBlockSchema>;
export type ListBlock = z.infer<typeof listBlockSchema>;
export type DividerBlock = z.infer<typeof dividerBlockSchema>;

export const blocksSchema = z.array(blockSchema);

export const postInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: blocksSchema.default([]),
  excerpt: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
  featuredImage: z.string().nullable().optional(),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  focusKeyword: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
  canonicalUrl: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

export const pageInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: blocksSchema.default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  focusKeyword: z.string().nullable().optional(),
  noIndex: z.boolean().default(false),
  canonicalUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export type PostInput = z.infer<typeof postInputSchema>;
export type PageInput = z.infer<typeof pageInputSchema>;
