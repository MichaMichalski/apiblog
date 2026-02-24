import Link from "next/link";
import styles from "./public.module.css";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  featuredImage: string | null;
  authorName: string;
}

export default function PostCard({
  title,
  slug,
  excerpt,
  publishedAt,
  featuredImage,
  authorName,
}: PostCardProps) {
  return (
    <article className={styles.postCard}>
      {featuredImage && (
        <Link href={`/blog/${slug}`} className={styles.postCardImage}>
          <img src={featuredImage} alt={title} loading="lazy" />
        </Link>
      )}
      <div className={styles.postCardContent}>
        <Link href={`/blog/${slug}`} className={styles.postCardTitle}>
          <h2>{title}</h2>
        </Link>
        <div className={styles.postMeta}>
          <span>{authorName}</span>
          {publishedAt && (
            <>
              <span className={styles.metaDot}>·</span>
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </>
          )}
        </div>
        {excerpt && <p className={styles.postExcerpt}>{excerpt}</p>}
      </div>
    </article>
  );
}
