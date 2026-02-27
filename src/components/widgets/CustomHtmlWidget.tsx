import styles from "./widgets.module.css";

interface CustomHtmlWidgetProps {
  content: string;
}

export default function CustomHtmlWidget({ content }: CustomHtmlWidgetProps) {
  if (!content) return null;

  return (
    <div className={styles.widget}>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
