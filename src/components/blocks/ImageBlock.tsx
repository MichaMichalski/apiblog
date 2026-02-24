import type { ImageBlock as ImageBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function ImageBlock({ block }: { block: ImageBlockType }) {
  const positionClass = styles[`image_${block.position ?? "full"}`] ?? "";

  return (
    <figure className={`${styles.imageBlock} ${positionClass}`}>
      <img src={block.src} alt={block.alt || ""} loading="lazy" />
      {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
    </figure>
  );
}
