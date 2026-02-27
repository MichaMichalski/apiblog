import { getWidgetsForArea } from "@/lib/widgets";
import TextWidget from "./TextWidget";
import RecentPostsWidget from "./RecentPostsWidget";
import SearchWidget from "./SearchWidget";
import CustomHtmlWidget from "./CustomHtmlWidget";
import SocialLinksWidget from "./SocialLinksWidget";
import NewsletterWidget from "./NewsletterWidget";
import styles from "./widgets.module.css";

interface WidgetAreaProps {
  areaId: string;
  className?: string;
}

export default async function WidgetArea({ areaId, className }: WidgetAreaProps) {
  const widgets = await getWidgetsForArea(areaId);

  if (widgets.length === 0) return null;

  return (
    <div className={`${styles.widgetArea} ${className ?? ""}`}>
      {widgets.map((widget) => {
        const s = widget.settings as Record<string, unknown>;
        switch (widget.type) {
          case "text":
            return <TextWidget key={widget.id} title={s.title as string} content={s.content as string} />;
          case "recent-posts":
            return (
              <RecentPostsWidget
                key={widget.id}
                title={s.title as string}
                count={s.count as number}
                showDate={s.showDate as boolean}
                showImage={s.showImage as boolean}
              />
            );
          case "search":
            return <SearchWidget key={widget.id} title={s.title as string} placeholder={s.placeholder as string} />;
          case "custom-html":
            return <CustomHtmlWidget key={widget.id} content={s.content as string} />;
          case "social-links":
            return <SocialLinksWidget key={widget.id} title={s.title as string} links={s.links as { platform: string; url: string }[]} />;
          case "newsletter":
            return (
              <NewsletterWidget
                key={widget.id}
                title={s.title as string}
                description={s.description as string}
                action={s.action as string}
              />
            );
          case "categories":
          case "tag-cloud":
            return (
              <div key={widget.id} className={styles.widget}>
                <h3 className={styles.widgetTitle}>{(s.title as string) || widget.type}</h3>
                <p className={styles.widgetPlaceholder}>Kommt bald.</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
