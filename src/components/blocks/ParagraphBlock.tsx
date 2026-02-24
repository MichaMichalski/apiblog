import type { ParagraphBlock as ParagraphBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function ParagraphBlock({ block }: { block: ParagraphBlockType }) {
  return (
    <p
      className={styles.paragraph}
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  );
}
