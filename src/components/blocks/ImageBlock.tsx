import type { ImageBlock as ImageBlockType } from "@/lib/blocks";
import ResponsiveImage from "@/components/shared/ResponsiveImage";
import styles from "./blocks.module.css";

interface ImageBlockProps {
  block: ImageBlockType;
  width?: number;
  height?: number;
}

export default function ImageBlock({ block, width, height }: ImageBlockProps) {
  const positionClass = styles[`image_${block.position ?? "full"}`] ?? "";

  return (
    <figure className={`${styles.imageBlock} ${positionClass}`}>
      <ResponsiveImage
        src={block.src}
        alt={block.alt || ""}
        width={width ?? 0}
        height={height ?? 0}
      />
      {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
    </figure>
  );
}
