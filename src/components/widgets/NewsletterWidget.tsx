import styles from "./widgets.module.css";

interface NewsletterWidgetProps {
  title: string;
  description: string;
  action: string;
}

export default function NewsletterWidget({ title, description, action }: NewsletterWidgetProps) {
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      {description && <p className={styles.widgetNewsletterDesc}>{description}</p>}
      <form className={styles.widgetNewsletterForm} action={action || "#"} method="post">
        <input
          type="email"
          name="email"
          className={styles.widgetSearchInput}
          placeholder="E-Mail-Adresse"
          required
        />
        <button type="submit" className={styles.widgetSearchButton} style={{ width: "100%" }}>
          Abonnieren
        </button>
      </form>
    </div>
  );
}
