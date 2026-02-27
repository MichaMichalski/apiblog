import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getBlogLayout } from "@/lib/customizer";
import PostCard from "@/components/public/PostCard";
import WidgetArea from "@/components/widgets/WidgetArea";
import styles from "@/components/public/public.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Alle Blogbeiträge",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const blogLayout = await getBlogLayout();
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const perPage = blogLayout.postsPerPage;

  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * perPage,
      take: perPage,
      include: { author: { select: { name: true } } },
    }),
    prisma.post.count({ where: { status: "published" } }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns:
      blogLayout.layout === "list"
        ? "1fr"
        : `repeat(auto-fill, minmax(${blogLayout.columns <= 2 ? "400px" : "340px"}, 1fr))`,
  };

  const content = (
    <>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Blog</h1>
        <p className={styles.heroDescription}>Alle Beiträge</p>
      </section>

      {posts.length > 0 ? (
        <section className={styles.postsGrid} style={gridStyle}>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={blogLayout.showExcerpt ? post.excerpt.slice(0, blogLayout.excerptLength) : ""}
              publishedAt={blogLayout.showDate ? (post.publishedAt?.toISOString() ?? null) : null}
              featuredImage={blogLayout.showFeaturedImage ? post.featuredImage : null}
              authorName={blogLayout.showAuthor ? post.author.name : ""}
              showReadMore={blogLayout.showReadMore}
              readMoreText={blogLayout.readMoreText}
            />
          ))}
        </section>
      ) : (
        <div className={styles.emptyState}>
          <p>Noch keine Beiträge vorhanden.</p>
        </div>
      )}

      {blogLayout.pagination === "numbered" && totalPages > 1 && (
        <nav className={styles.pagination}>
          {currentPage > 1 && (
            <Link href={`/blog?page=${currentPage - 1}`} className={styles.paginationLink}>
              ← Zurück
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`${styles.paginationLink} ${p === currentPage ? styles.paginationActive : ""}`}
            >
              {p}
            </Link>
          ))}
          {currentPage < totalPages && (
            <Link href={`/blog?page=${currentPage + 1}`} className={styles.paginationLink}>
              Weiter →
            </Link>
          )}
        </nav>
      )}
    </>
  );

  if (blogLayout.sidebarEnabled) {
    return (
      <div
        className={styles.blogWithSidebar}
        style={{ flexDirection: blogLayout.sidebarPosition === "left" ? "row-reverse" : "row" }}
      >
        <div className={styles.blogMainColumn}>{content}</div>
        <aside className={styles.blogSidebar}>
          <WidgetArea areaId="sidebar" />
        </aside>
      </div>
    );
  }

  return content;
}
