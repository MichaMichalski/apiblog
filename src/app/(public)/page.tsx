import { prisma } from "@/lib/db";
import { getSiteFromDB } from "@/lib/site";
import { getHomepageSettings } from "@/lib/customizer";
import PostCard from "@/components/public/PostCard";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "@/lib/blocks";
import styles from "@/components/public/public.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export default async function HomePage() {
  const [site, homepageSettings] = await Promise.all([
    getSiteFromDB(),
    getHomepageSettings(),
  ]);

  if (homepageSettings.type === "page" && homepageSettings.staticPageId) {
    const page = await prisma.page.findUnique({
      where: { id: homepageSettings.staticPageId, status: "published" },
    });

    if (page) {
      const blocks: Block[] = JSON.parse(page.content);
      return (
        <>
          <WebSiteJsonLd name={site.name} description={site.description} url={SITE_URL} />
          <div className={styles.pageContent}>
            <BlockRenderer blocks={blocks} />
          </div>
        </>
      );
    }
  }

  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: site.postsPerPage,
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <WebSiteJsonLd
        name={site.name}
        description={site.description}
        url={SITE_URL}
      />

      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>{site.name}</h1>
        <p className={styles.heroDescription}>{site.description}</p>
      </section>

      {posts.length > 0 ? (
        <section className={styles.postsGrid}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              publishedAt={post.publishedAt?.toISOString() ?? null}
              featuredImage={post.featuredImage}
              authorName={post.author.name}
            />
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>
          <p>Noch keine Beiträge vorhanden.</p>
        </div>
      )}
    </>
  );
}
