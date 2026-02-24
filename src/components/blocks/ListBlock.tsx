import type { ListBlock as ListBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function ListBlock({ block }: { block: ListBlockType }) {
  const Tag = block.style === "ordered" ? "ol" : "ul";
  return (
    <Tag className={styles.list}>
      {block.items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </Tag>
  );
}
