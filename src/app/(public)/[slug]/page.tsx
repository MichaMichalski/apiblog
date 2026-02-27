import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSiteFromDB } from "@/lib/site";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { WebPageJsonLd } from "@/components/seo/JsonLd";
import { getCanonicalUrl } from "@/lib/seo";
import type { Block } from "@/lib/blocks";
import styles from "@/components/public/public.module.css";

export const revalidate = 3600;

const reservedSlugs = ["blog", "admin", "api"];

export async function generateStaticParams() {
  const pages = await prisma.page.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return pages
    .filter((p) => !reservedSlugs.includes(p.slug))
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return {};

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || "";
  const canonical = page.canonicalUrl || getCanonicalUrl(`/${page.slug}`);

  const site = await getSiteFromDB();

  return {
    title,
    description,
    ...(page.noIndex && { robots: { index: false, follow: true } }),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (reservedSlugs.includes(slug)) notFound();

  const page = await prisma.page.findUnique({
    where: { slug, status: "published" },
  });

  if (!page) notFound();

  const site = await getSiteFromDB();
  const blocks: Block[] = JSON.parse(page.content);
  const canonical = page.canonicalUrl || getCanonicalUrl(`/${page.slug}`);

  return (
    <>
      <WebPageJsonLd
        title={page.seoTitle || page.title}
        description={page.seoDescription || ""}
        url={canonical}
        siteName={site.name}
      />
      <div className={styles.pageContent}>
        <h1 className={styles.pageTitle}>{page.title}</h1>
        <BlockRenderer blocks={blocks} />
      </div>
    </>
  );
}
