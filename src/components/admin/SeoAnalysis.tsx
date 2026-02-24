"use client";

import { useMemo } from "react";
import { analyzeSeo, type SeoCheck } from "@/lib/seo";
import type { Block } from "@/lib/blocks";
import styles from "./seo-analysis.module.css";

interface SeoAnalysisProps {
  title: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  slug: string;
  excerpt: string;
  blocks: Block[];
  featuredImage?: string | null;
}

export default function SeoAnalysis(props: SeoAnalysisProps) {
  const result = useMemo(() => analyzeSeo(props), [
    props.title, props.seoTitle, props.seoDescription,
    props.focusKeyword, props.slug, props.excerpt,
    props.blocks, props.featuredImage,
  ]);

  const percentage = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
  const color = percentage >= 70 ? "var(--color-success)" : percentage >= 40 ? "var(--color-warning)" : "var(--color-error)";
  const label = percentage >= 70 ? "Gut" : percentage >= 40 ? "Verbesserungswürdig" : "Mangelhaft";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.scoreRing} style={{ borderColor: color }}>
          <span className={styles.scoreNumber} style={{ color }}>{percentage}</span>
        </div>
        <div>
          <div className={styles.scoreLabel} style={{ color }}>{label}</div>
          <div className={styles.scoreDetail}>{result.score}/{result.maxScore} Checks bestanden</div>
        </div>
      </div>

      <div className={styles.checks}>
        {result.checks.map((check) => (
          <CheckItem key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

function CheckItem({ check }: { check: SeoCheck }) {
  const icon = check.status === "good" ? "✓" : check.status === "warning" ? "!" : "✕";
  const color =
    check.status === "good" ? "var(--color-success)" :
    check.status === "warning" ? "var(--color-warning)" :
    "var(--color-error)";

  return (
    <div className={styles.checkItem}>
      <span className={styles.checkIcon} style={{ color, borderColor: color }}>{icon}</span>
      <div className={styles.checkContent}>
        <div className={styles.checkLabel}>{check.label}</div>
        <div className={styles.checkMessage}>{check.message}</div>
      </div>
    </div>
  );
}
