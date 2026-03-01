import Link from "next/link";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import styles from "./public.module.css";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  featuredImage: string | null;
  imageWidth?: number;
  imageHeight?: number;
  authorName: string;
  showReadMore?: boolean;
  readMoreText?: string;
}

export default function PostCard({
  title,
  slug,
  excerpt,
  publishedAt,
  featuredImage,
  imageWidth,
  imageHeight,
  authorName,
  showReadMore,
  readMoreText,
}: PostCardProps) {
  return (
    <article className={styles.postCard}>
      {featuredImage && (
        <Link href={`/blog/${slug}`} className={styles.postCardImage}>
          <ResponsiveImage
            src={featuredImage}
            alt={title}
            width={imageWidth ?? 0}
            height={imageHeight ?? 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Link>
      )}
      <div className={styles.postCardContent}>
        <Link href={`/blog/${slug}`} className={styles.postCardTitle}>
          <h2>{title}</h2>
        </Link>
        {(authorName || publishedAt) && (
          <div className={styles.postMeta}>
            {authorName && <span>{authorName}</span>}
            {authorName && publishedAt && <span className={styles.metaDot}>·</span>}
            {publishedAt && (
              <time dateTime={publishedAt}>
                {new Date(publishedAt).toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>
        )}
        {excerpt && <p className={styles.postExcerpt}>{excerpt}</p>}
        {showReadMore && (
          <Link href={`/blog/${slug}`} className={styles.readMoreLink}>
            {readMoreText || "Weiterlesen"} →
          </Link>
        )}
      </div>
    </article>
  );
}
