import Link from "next/link";
import { prisma } from "@/lib/db";
import styles from "../../admin.module.css";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function PagesListPage() {
  const pages = await prisma.page.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Seiten</h1>
        <Link href="/admin/pages/new" className="btn btn-primary">
          Neue Seite
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {pages.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Reihenfolge</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    <Link href={`/admin/pages/${page.id}`} style={{ fontWeight: 500 }}>
                      {page.title}
                    </Link>
                  </td>
                  <td className="text-muted" style={{ fontSize: "0.8125rem" }}>{page.slug}</td>
                  <td>
                    <span className={`badge ${page.status === "published" ? "badge-published" : "badge-draft"}`}>
                      {page.status === "published" ? "Veröffentlicht" : "Entwurf"}
                    </span>
                  </td>
                  <td>{page.sortOrder}</td>
                  <td>
                    <div className="actions">
                      <Link href={`/admin/pages/${page.id}`} className="btn btn-secondary btn-sm">
                        Bearbeiten
                      </Link>
                      <DeleteButton id={page.id} type="pages" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p className="text-muted">Noch keine Seiten vorhanden.</p>
          </div>
        )}
      </div>
    </>
  );
}
