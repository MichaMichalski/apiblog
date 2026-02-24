import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.adminLayout}>{children}</div>;
}
