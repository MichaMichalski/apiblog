import type { CodeBlock as CodeBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

export default function CodeBlock({ block }: { block: CodeBlockType }) {
  return (
    <div className={styles.codeBlock}>
      {block.language && block.language !== "text" && (
        <div className={styles.codeLanguage}>{block.language}</div>
      )}
      <pre>
        <code>{block.content}</code>
      </pre>
    </div>
  );
}
