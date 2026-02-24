"use client";

import { useEffect, useRef } from "react";
import consentConfig from "@/config/consent.json";

export default function ScriptLoader() {
  const loaded = useRef<Set<string>>(new Set());

  useEffect(() => {
    function loadScripts() {
      let consent: Record<string, boolean> = {};
      try {
        consent = JSON.parse(localStorage.getItem("cookie-consent") || "{}");
      } catch {
        return;
      }

      for (const [category, config] of Object.entries(consentConfig.categories)) {
        if (!consent[category]) continue;

        for (const script of config.scripts) {
          const key = `${script.provider}-${"trackingId" in script ? script.trackingId : "publisherId" in script ? script.publisherId : ""}`;
          if (loaded.current.has(key)) continue;
          if ("trackingId" in script && !script.trackingId) continue;
          if ("publisherId" in script && !script.publisherId) continue;

          loaded.current.add(key);

          if (script.provider === "google-analytics" && "trackingId" in script) {
            loadGoogleAnalytics(script.trackingId);
          }
          if (script.provider === "google-adsense" && "publisherId" in script) {
            loadGoogleAdSense(script.publisherId);
          }
        }
      }
    }

    loadScripts();
    window.addEventListener("consent-updated", loadScripts);
    return () => window.removeEventListener("consent-updated", loadScripts);
  }, []);

  return null;
}

function loadGoogleAnalytics(trackingId: string) {
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
  script.async = true;
  document.head.appendChild(script);

  const w = window as unknown as Record<string, unknown>;
  w.dataLayer = (w.dataLayer as unknown[]) || [];
  function gtag(...args: unknown[]) {
    (w.dataLayer as unknown[]).push(args);
  }
  gtag("js", new Date());
  gtag("config", trackingId);
}

function loadGoogleAdSense(publisherId: string) {
  const script = document.createElement("script");
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  script.async = true;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}
