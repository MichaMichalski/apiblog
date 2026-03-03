import type { HtmlBlock as HtmlBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function HtmlBlock({ block }: { block: HtmlBlockType }) {
  return (
    <div className={styles.htmlBlock}>
      <div dangerouslySetInnerHTML={{ __html: block.content }} />
      {block.caption && <p className={styles.caption}>{block.caption}</p>}
    </div>
  );
}
