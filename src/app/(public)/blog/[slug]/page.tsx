import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSiteFromDB } from "@/lib/site";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { getCanonicalUrl, estimateReadingTime } from "@/lib/seo";
import type { Block } from "@/lib/blocks";
import styles from "@/components/public/public.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!post) return {};

  const site = await getSiteFromDB();
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const canonical = post.canonicalUrl || getCanonicalUrl(`/blog/${post.slug}`);
  const image = post.featuredImage ? `${SITE_URL}${post.featuredImage}` : undefined;

  return {
    title,
    description,
    ...(post.noIndex && { robots: { index: false, follow: true } }),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "published" },
    include: { author: { select: { name: true } } },
  });

  if (!post) notFound();

  const site = await getSiteFromDB();
  const blocks: Block[] = JSON.parse(post.content);
  const readingTime = estimateReadingTime(blocks);
  const canonical = post.canonicalUrl || getCanonicalUrl(`/blog/${post.slug}`);

  return (
    <>
      <ArticleJsonLd
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        url={canonical}
        image={post.featuredImage ? `${SITE_URL}${post.featuredImage}` : null}
        publishedAt={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        updatedAt={post.updatedAt.toISOString()}
        authorName={post.author.name}
        siteName={site.name}
      />
      <article>
        <header className={styles.blogPostHeader}>
          <h1 className={styles.blogPostTitle}>{post.title}</h1>
          <div className={styles.postMeta} style={{ justifyContent: "center" }}>
            <span>{post.author.name}</span>
            {post.publishedAt && (
              <>
                <span className={styles.metaDot}>·</span>
                <time dateTime={post.publishedAt.toISOString()}>
                  {post.publishedAt.toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            )}
            <span className={styles.metaDot}>·</span>
            <span>{readingTime} Min. Lesezeit</span>
          </div>
        </header>

        {post.featuredImage && (
          <div style={{ maxWidth: "var(--layout-content-width)", margin: "0 auto 2rem", padding: "0 1.5rem" }}>
            <img
              src={post.featuredImage}
              alt={post.title}
              style={{ width: "100%", borderRadius: "var(--card-border-radius)" }}
            />
          </div>
        )}

        <div className={styles.blogPostContent}>
          <BlockRenderer blocks={blocks} />
        </div>
      </article>
    </>
  );
}
