import { getSiteFromDB } from "@/lib/site";
import styles from "./public.module.css";

export default async function Footer() {
  const site = await getSiteFromDB();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <p>{site.footer.text}</p>
      </div>
    </footer>
  );
}
