import { revalidatePath } from "next/cache";

export function revalidatePost(slug: string) {
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
  revalidatePath("/");
}

export function revalidatePage(slug: string) {
  revalidatePath(`/${slug}`);
  revalidatePath("/");
}

export function revalidateAll() {
  revalidatePath("/", "layout");
}
