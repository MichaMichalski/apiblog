import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}
