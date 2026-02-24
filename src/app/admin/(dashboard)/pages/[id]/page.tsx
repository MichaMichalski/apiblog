import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageForm from "@/components/admin/PageForm";
import styles from "../../../admin.module.css";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) notFound();

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Seite bearbeiten</h1>
      </div>
      <PageForm
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: JSON.parse(page.content),
          status: page.status,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          focusKeyword: page.focusKeyword,
          noIndex: page.noIndex,
          canonicalUrl: page.canonicalUrl,
          sortOrder: page.sortOrder,
        }}
      />
    </>
  );
}
