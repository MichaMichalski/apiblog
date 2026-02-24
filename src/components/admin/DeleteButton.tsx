"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id, type }: { id: string; type: "posts" | "pages" }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Wirklich löschen?")) return;

    const res = await fetch(`/api/v1/${type}/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Löschen fehlgeschlagen");
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      Löschen
    </button>
  );
}
