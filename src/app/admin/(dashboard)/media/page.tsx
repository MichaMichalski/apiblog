"use client";

import { useState, useEffect, useRef } from "react";
import styles from "../../admin.module.css";

interface MediaItem {
  id: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  createdAt: string;
}

function thumbnailPath(src: string, mimeType: string): string {
  if (mimeType === "image/svg+xml" || mimeType === "image/gif") return src;
  const ext = src.match(/\.[^.]+$/)?.[0] ?? "";
  const base = src.slice(0, -ext.length);
  return `${base}-thumb.webp`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  async function loadMedia() {
    const res = await fetch("/api/v1/upload");
    if (res.ok) {
      const data = await res.json();
      setMedia(data.media);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await loadMedia();
      } else {
        const data = await res.json();
        alert(data.error || "Upload fehlgeschlagen");
      }
    } catch {
      alert("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Medien</h1>
        <label className="btn btn-primary" style={{ cursor: "pointer" }}>
          {uploading ? "Wird hochgeladen..." : "Bild hochladen"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
            disabled={uploading}
          />
        </label>
      </div>

      {media.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem"
        }}>
          {media.map((item) => (
            <div key={item.id} className="card" style={{ padding: "0", overflow: "hidden" }}>
              <div style={{
                aspectRatio: "1",
                overflow: "hidden",
                background: "var(--color-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <img
                  src={thumbnailPath(item.path, item.mimeType)}
                  alt={item.alt || item.filename}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
              <div style={{ padding: "0.75rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.filename}
                </div>
                <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>
                  {formatSize(item.size)}
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => copyPath(item.path)}
                  style={{ width: "100%", marginTop: "0.5rem" }}
                >
                  Pfad kopieren
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="text-muted">Noch keine Medien hochgeladen.</p>
        </div>
      )}
    </>
  );
}
