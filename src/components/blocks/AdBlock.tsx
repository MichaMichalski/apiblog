"use client";

import { useEffect, useRef } from "react";
import type { AdBlock as AdBlockType } from "@/lib/blocks";
import styles from "./blocks.module.css";

function hasConsent(category: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const consent = JSON.parse(localStorage.getItem("cookie-consent") || "{}");
    return consent[category] === true;
  } catch {
    return false;
  }
}

export default function AdBlock({ block }: { block: AdBlockType }) {
  const adRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    if (!hasConsent("advertising")) return;
    loaded.current = true;

    if (block.provider === "adsense" && block.slot) {
      try {
        const w = window as unknown as Record<string, unknown>;
        const adsbygoogle = (w.adsbygoogle as unknown[]) || [];
        adsbygoogle.push({});
        w.adsbygoogle = adsbygoogle;
      } catch {
        // AdSense not loaded
      }
    }
  }, [block.provider, block.slot]);

  if (typeof window !== "undefined" && !hasConsent("advertising")) {
    return null;
  }

  if (block.provider === "adsense") {
    return (
      <div className={styles.adBlock} ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center" }}
          data-ad-layout={block.format === "in-article" ? "in-article" : undefined}
          data-ad-format={block.format === "in-article" ? "fluid" : "auto"}
          data-ad-slot={block.slot || ""}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return null;
}
