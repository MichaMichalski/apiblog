"use client";

import { type Block } from "@/lib/blocks";
import styles from "@/app/admin/admin.module.css";

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

const blockTypes: { type: Block["type"]; label: string }[] = [
  { type: "paragraph", label: "Absatz" },
  { type: "heading", label: "Überschrift" },
  { type: "image", label: "Bild" },
  { type: "quote", label: "Zitat" },
  { type: "code", label: "Code" },
  { type: "list", label: "Liste" },
  { type: "divider", label: "Trennlinie" },
  { type: "ad", label: "Werbung" },
];

function createBlock(type: Block["type"]): Block {
  switch (type) {
    case "paragraph": return { type: "paragraph", content: "" };
    case "heading": return { type: "heading", level: 2, content: "" };
    case "image": return { type: "image", src: "", alt: "", position: "full" };
    case "quote": return { type: "quote", content: "" };
    case "code": return { type: "code", language: "text", content: "" };
    case "list": return { type: "list", style: "unordered", items: [""] };
    case "divider": return { type: "divider" };
    case "ad": return { type: "ad", provider: "adsense", slot: "", format: "in-article" };
  }
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  function addBlock(type: Block["type"]) {
    onChange([...blocks, createBlock(type)]);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    onChange(newBlocks);
  }

  function updateBlock(index: number, updated: Block) {
    const newBlocks = [...blocks];
    newBlocks[index] = updated;
    onChange(newBlocks);
  }

  return (
    <div>
      <div className={styles.blockList}>
        {blocks.map((block, index) => (
          <div key={index} className={styles.blockItem}>
            <div className={styles.blockItemHeader}>
              <span className={styles.blockTypeLabel}>{block.type}</span>
              <div className={styles.blockActions}>
                <button
                  className={styles.blockActionBtn}
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  className={styles.blockActionBtn}
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                >
                  ↓
                </button>
                <button
                  className={styles.blockActionBtn}
                  onClick={() => removeBlock(index)}
                  style={{ color: "var(--color-error)" }}
                >
                  ✕
                </button>
              </div>
            </div>
            <BlockFieldEditor block={block} onChange={(b) => updateBlock(index, b)} />
          </div>
        ))}
      </div>

      <div className={styles.addBlockBar}>
        {blockTypes.map((bt) => (
          <button
            key={bt.type}
            className="btn btn-secondary btn-sm"
            onClick={() => addBlock(bt.type)}
          >
            + {bt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockFieldEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (b: Block) => void;
}) {
  switch (block.type) {
    case "paragraph":
      return (
        <textarea
          className="textarea"
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Text eingeben..."
          rows={3}
        />
      );

    case "heading":
      return (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            className="select"
            value={block.level}
            onChange={(e) => onChange({ ...block, level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
            style={{ width: "80px" }}
          >
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l}>H{l}</option>
            ))}
          </select>
          <input
            className="input"
            value={block.content}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Überschrift..."
          />
        </div>
      );

    case "image":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input
            className="input"
            value={block.src}
            onChange={(e) => onChange({ ...block, src: e.target.value })}
            placeholder="Bild-URL (z.B. /uploads/bild.jpg)"
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              className="input"
              value={block.alt}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
              placeholder="Alt-Text"
            />
            <select
              className="select"
              value={block.position ?? "full"}
              onChange={(e) => onChange({ ...block, position: e.target.value as "full" | "left" | "right" | "inline" })}
              style={{ width: "120px" }}
            >
              <option value="full">Volle Breite</option>
              <option value="left">Links</option>
              <option value="right">Rechts</option>
              <option value="inline">Inline</option>
            </select>
          </div>
          <input
            className="input"
            value={block.caption ?? ""}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Bildunterschrift (optional)"
          />
        </div>
      );

    case "quote":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <textarea
            className="textarea"
            value={block.content}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Zitat..."
            rows={2}
          />
          <input
            className="input"
            value={block.author ?? ""}
            onChange={(e) => onChange({ ...block, author: e.target.value })}
            placeholder="Autor (optional)"
          />
        </div>
      );

    case "code":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <input
            className="input"
            value={block.language}
            onChange={(e) => onChange({ ...block, language: e.target.value })}
            placeholder="Sprache (z.B. javascript)"
            style={{ width: "200px" }}
          />
          <textarea
            className="textarea"
            value={block.content}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Code eingeben..."
            rows={4}
            style={{ fontFamily: "monospace" }}
          />
        </div>
      );

    case "list":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <select
            className="select"
            value={block.style}
            onChange={(e) => onChange({ ...block, style: e.target.value as "ordered" | "unordered" })}
            style={{ width: "200px" }}
          >
            <option value="unordered">Aufzählung</option>
            <option value="ordered">Nummeriert</option>
          </select>
          {block.items.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                className="input"
                value={item}
                onChange={(e) => {
                  const newItems = [...block.items];
                  newItems[i] = e.target.value;
                  onChange({ ...block, items: newItems });
                }}
                placeholder={`Punkt ${i + 1}`}
              />
              <button
                className={styles.blockActionBtn}
                onClick={() => {
                  const newItems = block.items.filter((_, idx) => idx !== i);
                  onChange({ ...block, items: newItems.length > 0 ? newItems : [""] });
                }}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            style={{ alignSelf: "start" }}
          >
            + Punkt hinzufügen
          </button>
        </div>
      );

    case "ad":
      return (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="input"
            value={block.slot ?? ""}
            onChange={(e) => onChange({ ...block, slot: e.target.value })}
            placeholder="Ad Slot ID"
          />
          <select
            className="select"
            value={block.format}
            onChange={(e) => onChange({ ...block, format: e.target.value as "in-article" | "display" | "in-feed" })}
            style={{ width: "150px" }}
          >
            <option value="in-article">In-Article</option>
            <option value="display">Display</option>
            <option value="in-feed">In-Feed</option>
          </select>
        </div>
      );

    case "divider":
      return <p className="text-muted" style={{ fontSize: "0.8125rem" }}>Trennlinie (keine Optionen)</p>;

    default:
      return null;
  }
}
