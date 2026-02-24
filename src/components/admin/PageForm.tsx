"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Block } from "@/lib/blocks";
import BlockEditor from "./BlockEditor";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import SeoAnalysis from "./SeoAnalysis";
import styles from "@/app/admin/admin.module.css";

interface PageFormProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    content: Block[];
    status: string;
    seoTitle: string | null;
    seoDescription: string | null;
    focusKeyword: string | null;
    noIndex: boolean;
    canonicalUrl: string | null;
    sortOrder: number;
  };
}

export default function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const isEditing = !!page;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [blocks, setBlocks] = useState<Block[]>(page?.content ?? []);
  const [status, setStatus] = useState(page?.status ?? "draft");
  const [seoTitle, setSeoTitle] = useState(page?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page?.seoDescription ?? "");
  const [focusKeyword, setFocusKeyword] = useState(page?.focusKeyword ?? "");
  const [noIndex, setNoIndex] = useState(page?.noIndex ?? false);
  const [canonicalUrl, setCanonicalUrl] = useState(page?.canonicalUrl ?? "");
  const [sortOrder, setSortOrder] = useState(page?.sortOrder ?? 0);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[äÄ]/g, "ae").replace(/[öÖ]/g, "oe").replace(/[üÜ]/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!isEditing) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const body = {
        title,
        slug,
        content: blocks,
        status,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        focusKeyword: focusKeyword || null,
        noIndex,
        canonicalUrl: canonicalUrl || null,
        sortOrder,
      };

      const url = isEditing ? `/api/v1/pages/${page.id}` : "/api/v1/pages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Speichern fehlgeschlagen");
        return;
      }

      router.push("/admin/pages");
      router.refresh();
    } catch {
      setError("Ein Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className={styles.editorGrid}>
        <div className={styles.editorMain}>
          <div className="form-group">
            <label className="label">Titel</label>
            <input
              className="input"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Seitentitel"
              required
              style={{ fontSize: "1.25rem", padding: "0.75rem" }}
            />
          </div>

          <div className="form-group">
            <label className="label">Slug</label>
            <input
              className="input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
              required
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            />
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "editor" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("editor")}
            >
              Editor
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "preview" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Vorschau
            </button>
          </div>

          {activeTab === "editor" ? (
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          ) : (
            <div className={styles.preview}>
              <div className={styles.previewTitle}>Vorschau</div>
              {blocks.length > 0 ? (
                <BlockRenderer blocks={blocks} />
              ) : (
                <p className="text-muted">Keine Blöcke vorhanden</p>
              )}
            </div>
          )}
        </div>

        <div className={styles.editorSidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>Veröffentlichung</div>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Entwurf</option>
                <option value="published">Veröffentlicht</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Reihenfolge</label>
              <input
                className="input"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "100%" }}>
              {saving ? "Wird gespeichert..." : isEditing ? "Aktualisieren" : "Erstellen"}
            </button>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>SEO-Analyse</div>
            <SeoAnalysis
              title={title}
              seoTitle={seoTitle}
              seoDescription={seoDescription}
              focusKeyword={focusKeyword}
              slug={slug}
              excerpt=""
              blocks={blocks}
            />
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>SEO-Einstellungen</div>
            <div className="form-group">
              <label className="label">Fokus-Keyword</label>
              <input
                className="input"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="z.B. impressum kontakt"
              />
            </div>
            <div className="form-group">
              <label className="label">SEO-Titel</label>
              <input
                className="input"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "SEO-Titel (optional)"}
              />
              <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {(seoTitle || title).length}/60 Zeichen
              </div>
            </div>
            <div className="form-group">
              <label className="label">Meta-Beschreibung</label>
              <textarea
                className="textarea"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta-Beschreibung (optional)"
                rows={3}
              />
              <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {seoDescription.length}/160 Zeichen
              </div>
            </div>
            <div className="form-group">
              <label className="label">Canonical URL</label>
              <input
                className="input"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://... (optional)"
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                style={{ accentColor: "var(--color-primary)" }}
              />
              Seite von Suchmaschinen ausschließen (noindex)
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
