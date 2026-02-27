import styles from "./widgets.module.css";

interface SocialLinksWidgetProps {
  title: string;
  links: { platform: string; url: string }[];
}

const PLATFORM_INITIALS: Record<string, string> = {
  twitter: "X",
  x: "X",
  github: "GH",
  linkedin: "in",
  facebook: "fb",
  instagram: "IG",
  youtube: "YT",
  mastodon: "M",
  tiktok: "TT",
};

export default function SocialLinksWidget({ title, links }: SocialLinksWidgetProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className={styles.widget}>
      {title && <h3 className={styles.widgetTitle}>{title}</h3>}
      <div className={styles.widgetSocialLinks}>
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            className={styles.widgetSocialLink}
            target="_blank"
            rel="noopener noreferrer"
            title={link.platform}
          >
            {PLATFORM_INITIALS[link.platform.toLowerCase()] || link.platform.slice(0, 2).toUpperCase()}
          </a>
        ))}
      </div>
    </div>
  );
}
