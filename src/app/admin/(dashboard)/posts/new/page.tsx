import PostForm from "@/components/admin/PostForm";
import styles from "../../../admin.module.css";

export default function NewPostPage() {
  return (
    <>
      <div className={styles.topBar}>
        <h1 className="page-title">Neuer Beitrag</h1>
      </div>
      <PostForm />
    </>
  );
}
