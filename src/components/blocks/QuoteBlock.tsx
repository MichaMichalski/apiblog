import type { QuoteBlock as QuoteBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function QuoteBlock({ block }: { block: QuoteBlockType }) {
  return (
    <blockquote className={styles.quote}>
      <p>{block.content}</p>
      {block.author && <cite className={styles.quoteAuthor}>— {block.author}</cite>}
    </blockquote>
  );
}
