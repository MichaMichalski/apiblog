import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import PostCard from "@/components/public/PostCard";
import styles from "@/components/public/public.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Alle Blogbeiträge",
};

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Blog</h1>
        <p className={styles.heroDescription}>Alle Beiträge</p>
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
