import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/PostForm";
import styles from "../../../admin.module.css";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Beitrag bearbeiten</h1>
      </div>
      <PostForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: JSON.parse(post.content),
          excerpt: post.excerpt,
          status: post.status,
          featuredImage: post.featuredImage,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          focusKeyword: post.focusKeyword,
          noIndex: post.noIndex,
          canonicalUrl: post.canonicalUrl,
        }}
      />
    </>
  );
}
