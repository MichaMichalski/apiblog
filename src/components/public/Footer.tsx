import siteConfig from "@/config/site.json";
import styles from "./public.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p>{siteConfig.footer.text}</p>
      </div>
    </footer>
  );
}
