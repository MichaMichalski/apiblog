import type { HeadingBlock as HeadingBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function HeadingBlock({ block }: { block: HeadingBlockType }) {
  const level = Math.min(Math.max(block.level, 1), 6);
  switch (level) {
    case 1: return <h1 className={styles.heading}>{block.content}</h1>;
    case 2: return <h2 className={styles.heading}>{block.content}</h2>;
    case 3: return <h3 className={styles.heading}>{block.content}</h3>;
    case 4: return <h4 className={styles.heading}>{block.content}</h4>;
    case 5: return <h5 className={styles.heading}>{block.content}</h5>;
    case 6: return <h6 className={styles.heading}>{block.content}</h6>;
    default: return <h2 className={styles.heading}>{block.content}</h2>;
  }
}
