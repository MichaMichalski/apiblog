import styles from "./widgets.module.css";

interface TextWidgetProps {
  title: string;
  content: string;
}

export default function TextWidget({ title, content }: TextWidgetProps) {
  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <div className={styles.widgetContent} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
