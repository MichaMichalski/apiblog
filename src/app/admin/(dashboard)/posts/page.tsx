import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "../../admin.module.css";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function PostsListPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Beiträge</h1>
        <Link href="/admin/posts/new" className="btn btn-primary">
          Neuer Beitrag
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {posts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Autor</th>
                <th>Datum</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/admin/posts/${post.id}`} style={{ fontWeight: 500 }}>
                      {post.title}
                    </Link>
                  </td>
                  <td className="text-muted" style={{ fontSize: "0.8125rem" }}>{post.slug}</td>
                  <td>
                    <span className={`badge ${post.status === "published" ? "badge-published" : "badge-draft"}`}>
                      {post.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                  </td>
                  <td>{post.author.name}</td>
                  <td className="text-muted" style={{ fontSize: "0.8125rem" }}>
                    {post.updatedAt.toLocaleDateString("de-DE")}
                  </td>
                  <td>
                    <div className="actions">
                      <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary btn-sm">
                        Bearbeiten
                      </Link>
                      <DeleteButton id={post.id} type="posts" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p className="text-muted">Noch keine Beiträge vorhanden.</p>
          </div>
        )}
      </div>
    </>
  );
}
