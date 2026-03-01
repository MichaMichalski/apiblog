"use client";

import { useState, useCallback } from "react";
import styles from "./public.module.css";

interface MobileMenuToggleProps {
  children: React.ReactNode;
}

export default function MobileMenuToggle({ children }: MobileMenuToggleProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        className={styles.mobileMenuButton}
        onClick={toggle}
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
        aria-expanded={open}
      >
        <span className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ""}`} />
      </button>
      {open && <div className={styles.mobileMenuOverlay} onClick={close} />}
      <div className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ""}`}>
        <div className={styles.mobileMenuInner} onClick={(e) => {
          if ((e.target as HTMLElement).tagName === "A") close();
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
