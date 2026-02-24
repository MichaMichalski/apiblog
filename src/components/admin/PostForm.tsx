"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Block } from "@/lib/blocks";
import BlockEditor from "./BlockEditor";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import SeoAnalysis from "./SeoAnalysis";
import styles from "@/app/admin/admin.module.css";

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    content: Block[];
    excerpt: string;
    status: string;
    featuredImage: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    focusKeyword: string | null;
    noIndex: boolean;
    canonicalUrl: string | null;
  };
}

export default function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [blocks, setBlocks] = useState<Block[]>(post?.content ?? []);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword ?? "");
  const [noIndex, setNoIndex] = useState(post?.noIndex ?? false);
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? "");
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
        excerpt,
        status,
        featuredImage: featuredImage || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        focusKeyword: focusKeyword || null,
        noIndex,
        canonicalUrl: canonicalUrl || null,
      };

      const url = isEditing ? `/api/v1/posts/${post.id}` : "/api/v1/posts";
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

      router.push("/admin/posts");
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
              placeholder="Beitragstitel"
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
              excerpt={excerpt}
              blocks={blocks}
              featuredImage={featuredImage || null}
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
                placeholder="z.B. reise berlin tipps"
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
                placeholder={excerpt || "Meta-Beschreibung (optional)"}
                rows={3}
              />
              <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                {(seoDescription || excerpt).length}/160 Zeichen
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

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>Auszug</div>
            <textarea
              className="textarea"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Kurzer Auszug für die Übersicht..."
              rows={3}
            />
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardTitle}>Beitragsbild</div>
            <input
              className="input"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="/uploads/bild.jpg"
            />
            {featuredImage && (
              <img
                src={featuredImage}
                alt="Vorschau"
                style={{ width: "100%", borderRadius: "4px", marginTop: "0.5rem" }}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
