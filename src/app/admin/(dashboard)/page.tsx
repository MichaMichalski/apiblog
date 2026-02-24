import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "../admin.module.css";

export default async function AdminDashboard() {
  const [postCount, pageCount, mediaCount, publishedPosts] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.media.count(),
    prisma.post.count({ where: { status: "published" } }),
  ]);

  const recentPosts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Beiträge gesamt</div>
          <div className={styles.statValue}>{postCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Veröffentlicht</div>
          <div className={styles.statValue}>{publishedPosts}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Seiten</div>
          <div className={styles.statValue}>{pageCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Medien</div>
          <div className={styles.statValue}>{mediaCount}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem" }}>Letzte Beiträge</h2>
          <Link href="/admin/posts/new" className="btn btn-primary btn-sm">
            Neuer Beitrag
          </Link>
        </div>
        {recentPosts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Status</th>
                <th>Autor</th>
                <th>Aktualisiert</th>
              </tr>
            </thead>
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/admin/posts/${post.id}`}>{post.title}</Link>
                  </td>
                  <td>
                    <span className={`badge ${post.status === "published" ? "badge-published" : "badge-draft"}`}>
                      {post.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                  </td>
                  <td>{post.author.name}</td>
                  <td className="text-muted" style={{ fontSize: "0.8125rem" }}>
                    {post.updatedAt.toLocaleDateString("de-DE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">Noch keine Beiträge vorhanden.</p>
        )}
      </div>
    </>
  );
}
