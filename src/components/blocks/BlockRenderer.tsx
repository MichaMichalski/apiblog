import type { Block } from "@/lib/blocks";
import ParagraphBlock from "./ParagraphBlock";
import HeadingBlock from "./HeadingBlock";
import ImageBlock from "./ImageBlock";
import AdBlock from "./AdBlock";
import QuoteBlock from "./QuoteBlock";
import CodeBlock from "./CodeBlock";
import ListBlock from "./ListBlock";
import DividerBlock from "./DividerBlock";
import styles from "./blocks.module.css";

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className={styles.blockContainer}>
      {blocks.map((block, index) => (
        <div key={index} className={styles.block}>
          {renderBlock(block)}
        </div>
      ))}
    </div>
  );
}

function renderBlock(block: Block) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphBlock block={block} />;
    case "heading":
      return <HeadingBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "ad":
      return <AdBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "code":
      return <CodeBlock block={block} />;
    case "list":
      return <ListBlock block={block} />;
    case "divider":
      return <DividerBlock />;
    default: {
      const fallback = block as { type: string; content?: string };
      return <p>{fallback.content ?? `[Unknown block: ${fallback.type}]`}</p>;
    }
  }
}
