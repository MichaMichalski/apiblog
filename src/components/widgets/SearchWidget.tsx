import styles from "./widgets.module.css";

interface SearchWidgetProps {
  title: string;
  placeholder: string;
}

export default function SearchWidget({ title, placeholder }: SearchWidgetProps) {
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <form className={styles.widgetSearchForm} action="/blog" method="get">
        <input
          type="search"
          name="q"
          className={styles.widgetSearchInput}
          placeholder={placeholder || "Suchen..."}
        />
        <button type="submit" className={styles.widgetSearchButton}>
          Suche
        </button>
      </form>
    </div>
  );
}
