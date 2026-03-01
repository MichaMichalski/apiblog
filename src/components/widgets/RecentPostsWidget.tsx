import Link from "next/link";
import { prisma } from "@/lib/db";
import { getThumbnailPath } from "@/lib/media";
import styles from "./widgets.module.css";

interface RecentPostsWidgetProps {
  title: string;
  count: number;
  showDate: boolean;
  showImage: boolean;
}

export default async function RecentPostsWidget({ title, count, showDate, showImage }: RecentPostsWidgetProps) {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: count || 5,
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      featuredImage: true,
    },
  });

  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <ul className={styles.widgetList}>
        {posts.map((post) => (
          <li key={post.slug} className={styles.widgetListItem}>
            {showImage && post.featuredImage && (
              <img src={getThumbnailPath(post.featuredImage)} alt={post.title} className={styles.widgetListItemImage} />
            )}
            <div className={styles.widgetListItemContent}>
              <Link href={`/blog/${post.slug}`} className={styles.widgetListItemTitle}>
                {post.title}
              </Link>
              {showDate && post.publishedAt && (
                <span className={styles.widgetListItemMeta}>
                  {new Date(post.publishedAt).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </li>
        ))}
        {posts.length === 0 && (
          <li className={styles.widgetPlaceholder}>Keine Beiträge vorhanden.</li>
        )}
      </ul>
    </div>
  );
}
