import type { Block } from "./blocks";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function blocksToPlainText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph": return stripHtml(block.content);
        case "heading": return block.content;
        case "quote": return block.content;
        case "code": return "";
        case "list": return block.items.map(stripHtml).join(" ");
        default: return "";
      }
    })
    .filter(Boolean)
    .join(" ");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingTime(blocks: Block[]): number {
  const text = blocksToPlainText(blocks);
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 200));
}

export interface SeoScore {
  score: number;
  maxScore: number;
  checks: SeoCheck[];
}

export interface SeoCheck {
  id: string;
  label: string;
  status: "good" | "warning" | "error";
  message: string;
}

export function analyzeSeo(params: {
  title: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  slug: string;
  excerpt: string;
  blocks: Block[];
  featuredImage?: string | null;
}): SeoScore {
  const checks: SeoCheck[] = [];
  const effectiveTitle = params.seoTitle || params.title;
  const effectiveDesc = params.seoDescription || params.excerpt;
  const plainText = blocksToPlainText(params.blocks).toLowerCase();
  const keyword = params.focusKeyword?.toLowerCase().trim() || "";

  // Title length
  if (effectiveTitle.length === 0) {
    checks.push({ id: "title-missing", label: "SEO-Titel", status: "error", message: "Kein Titel vorhanden." });
  } else if (effectiveTitle.length < 30) {
    checks.push({ id: "title-short", label: "SEO-Titel", status: "warning", message: `Titel ist zu kurz (${effectiveTitle.length} Zeichen). Empfohlen: 30-60.` });
  } else if (effectiveTitle.length > 60) {
    checks.push({ id: "title-long", label: "SEO-Titel", status: "warning", message: `Titel ist zu lang (${effectiveTitle.length} Zeichen). Empfohlen: 30-60.` });
  } else {
    checks.push({ id: "title-ok", label: "SEO-Titel", status: "good", message: `Titel hat eine gute Länge (${effectiveTitle.length} Zeichen).` });
  }

  // Meta description
  if (effectiveDesc.length === 0) {
    checks.push({ id: "desc-missing", label: "Meta-Beschreibung", status: "error", message: "Keine Meta-Beschreibung vorhanden." });
  } else if (effectiveDesc.length < 120) {
    checks.push({ id: "desc-short", label: "Meta-Beschreibung", status: "warning", message: `Beschreibung ist zu kurz (${effectiveDesc.length} Zeichen). Empfohlen: 120-160.` });
  } else if (effectiveDesc.length > 160) {
    checks.push({ id: "desc-long", label: "Meta-Beschreibung", status: "warning", message: `Beschreibung ist zu lang (${effectiveDesc.length} Zeichen). Empfohlen: 120-160.` });
  } else {
    checks.push({ id: "desc-ok", label: "Meta-Beschreibung", status: "good", message: `Beschreibung hat eine gute Länge (${effectiveDesc.length} Zeichen).` });
  }

  // Focus keyword
  if (!keyword) {
    checks.push({ id: "keyword-missing", label: "Fokus-Keyword", status: "warning", message: "Kein Fokus-Keyword definiert." });
  } else {
    // Keyword in title
    if (effectiveTitle.toLowerCase().includes(keyword)) {
      checks.push({ id: "keyword-title", label: "Keyword im Titel", status: "good", message: "Das Fokus-Keyword kommt im Titel vor." });
    } else {
      checks.push({ id: "keyword-title", label: "Keyword im Titel", status: "error", message: "Das Fokus-Keyword fehlt im Titel." });
    }

    // Keyword in description
    if (effectiveDesc.toLowerCase().includes(keyword)) {
      checks.push({ id: "keyword-desc", label: "Keyword in Beschreibung", status: "good", message: "Das Fokus-Keyword kommt in der Beschreibung vor." });
    } else {
      checks.push({ id: "keyword-desc", label: "Keyword in Beschreibung", status: "warning", message: "Das Fokus-Keyword fehlt in der Meta-Beschreibung." });
    }

    // Keyword in slug
    if (params.slug.includes(keyword.replace(/\s+/g, "-"))) {
      checks.push({ id: "keyword-slug", label: "Keyword im Slug", status: "good", message: "Das Fokus-Keyword kommt im URL-Slug vor." });
    } else {
      checks.push({ id: "keyword-slug", label: "Keyword im Slug", status: "warning", message: "Das Fokus-Keyword fehlt im URL-Slug." });
    }

    // Keyword in content
    const keywordCount = (plainText.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
    const words = countWords(plainText);
    if (keywordCount === 0) {
      checks.push({ id: "keyword-content", label: "Keyword im Text", status: "error", message: "Das Fokus-Keyword kommt nicht im Text vor." });
    } else {
      const density = words > 0 ? ((keywordCount / words) * 100) : 0;
      if (density < 0.5) {
        checks.push({ id: "keyword-content", label: "Keyword-Dichte", status: "warning", message: `Keyword kommt ${keywordCount}x vor (${density.toFixed(1)}%). Empfohlen: 0.5-2.5%.` });
      } else if (density > 2.5) {
        checks.push({ id: "keyword-content", label: "Keyword-Dichte", status: "warning", message: `Keyword kommt ${keywordCount}x vor (${density.toFixed(1)}%). Zu hoch, empfohlen: 0.5-2.5%.` });
      } else {
        checks.push({ id: "keyword-content", label: "Keyword-Dichte", status: "good", message: `Keyword kommt ${keywordCount}x vor (${density.toFixed(1)}%). Gute Dichte.` });
      }
    }

    // Keyword in first paragraph
    const firstParagraph = params.blocks.find((b) => b.type === "paragraph");
    if (firstParagraph && firstParagraph.type === "paragraph" && stripHtml(firstParagraph.content).toLowerCase().includes(keyword)) {
      checks.push({ id: "keyword-intro", label: "Keyword in Einleitung", status: "good", message: "Das Keyword kommt im ersten Absatz vor." });
    } else if (firstParagraph) {
      checks.push({ id: "keyword-intro", label: "Keyword in Einleitung", status: "warning", message: "Das Keyword fehlt im ersten Absatz." });
    }
  }

  // Content length
  const wordCount = countWords(plainText);
  if (wordCount < 100) {
    checks.push({ id: "content-short", label: "Textlänge", status: "error", message: `Nur ${wordCount} Wörter. Empfohlen: mindestens 300.` });
  } else if (wordCount < 300) {
    checks.push({ id: "content-short", label: "Textlänge", status: "warning", message: `${wordCount} Wörter. Empfohlen: mindestens 300.` });
  } else {
    checks.push({ id: "content-ok", label: "Textlänge", status: "good", message: `${wordCount} Wörter. Gute Textlänge.` });
  }

  // Headings check
  const headings = params.blocks.filter((b) => b.type === "heading");
  if (headings.length === 0) {
    checks.push({ id: "headings-missing", label: "Zwischenüberschriften", status: "warning", message: "Keine Zwischenüberschriften (H2-H6) vorhanden." });
  } else {
    checks.push({ id: "headings-ok", label: "Zwischenüberschriften", status: "good", message: `${headings.length} Zwischenüberschrift(en) vorhanden.` });
  }

  // Images
  const images = params.blocks.filter((b) => b.type === "image");
  if (images.length === 0 && !params.featuredImage) {
    checks.push({ id: "images-missing", label: "Bilder", status: "warning", message: "Keine Bilder vorhanden. Bilder verbessern das Engagement." });
  } else {
    const imagesWithoutAlt = images.filter((b) => b.type === "image" && !b.alt);
    if (imagesWithoutAlt.length > 0) {
      checks.push({ id: "images-alt", label: "Bild-Alt-Texte", status: "warning", message: `${imagesWithoutAlt.length} Bild(er) ohne Alt-Text.` });
    } else {
      checks.push({ id: "images-ok", label: "Bilder", status: "good", message: "Bilder vorhanden mit Alt-Texten." });
    }
  }

  // Internal links
  const linkMatches = params.blocks
    .filter((b) => b.type === "paragraph")
    .some((b) => b.type === "paragraph" && b.content.includes("<a "));
  if (!linkMatches) {
    checks.push({ id: "links-missing", label: "Interne Links", status: "warning", message: "Keine Links im Text gefunden." });
  } else {
    checks.push({ id: "links-ok", label: "Links", status: "good", message: "Links im Text vorhanden." });
  }

  const good = checks.filter((c) => c.status === "good").length;
  return { score: good, maxScore: checks.length, checks };
}
