import PageForm from "@/components/admin/PageForm";
import styles from "../../../admin.module.css";

export default function NewPagePage() {
  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Neue Seite</h1>
      </div>
      <PageForm />
    </>
  );
}
