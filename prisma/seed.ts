import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  // Seed default theme from file into DB
  const themePath = join(process.cwd(), "src", "config", "theme.json");
  const themeJson = readFileSync(themePath, "utf-8");
  await prisma.setting.upsert({
    where: { key: "theme" },
    update: { value: themeJson },
    create: { key: "theme", value: themeJson },
  });
  console.log("Seeded default theme into database.");

  // Seed default site config from file into DB
  const sitePath = join(process.cwd(), "src", "config", "site.json");
  const siteJson = readFileSync(sitePath, "utf-8");
  await prisma.setting.upsert({
    where: { key: "site" },
    update: { value: siteJson },
    create: { key: "site", value: siteJson },
  });
  console.log("Seeded default site config into database.");

  const passwordHash = await hash("admin123", 12);
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  });
  console.log(`Created admin user: ${user.email} (password: admin123)`);

  const post = await prisma.post.create({
    data: {
      title: "Willkommen zu Ihrem neuen Blog",
      slug: "willkommen",
      excerpt: "Dies ist Ihr erster Blogbeitrag. Bearbeiten oder löschen Sie ihn im Admin-Panel.",
      status: "published",
      publishedAt: new Date(),
      authorId: user.id,
      content: JSON.stringify([
        {
          type: "paragraph",
          content: "Herzlich willkommen! Dies ist Ihr erster Blogbeitrag, erstellt mit Ihrem neuen CMS.",
        },
        {
          type: "heading",
          level: 2,
          content: "Erste Schritte",
        },
        {
          type: "paragraph",
          content: "Melden Sie sich im <a href=\"/admin\">Admin-Panel</a> an und beginnen Sie, Inhalte zu erstellen. Sie können Beiträge und Seiten sowohl über die Benutzeroberfläche als auch über die REST-API verwalten.",
        },
        {
          type: "quote",
          content: "Der Inhalt wird als strukturierte Blöcke gespeichert — Absätze, Überschriften, Bilder, Code und mehr.",
          author: "Ihr CMS",
        },
        {
          type: "heading",
          level: 2,
          content: "Theme anpassen",
        },
        {
          type: "paragraph",
          content: "Das gesamte Aussehen Ihrer Website wird über die Datenbank gesteuert. Besuchen Sie den Theme-Editor im Admin-Panel oder nutzen Sie die REST-API.",
        },
        {
          type: "code",
          language: "bash",
          content: "curl http://localhost:3000/api/v1/theme",
        },
        {
          type: "paragraph",
          content: "Viel Spaß mit Ihrem neuen Blog!",
        },
      ]),
    },
  });
  console.log(`Created sample post: ${post.title}`);

  const page = await prisma.page.create({
    data: {
      title: "Über uns",
      slug: "ueber-uns",
      status: "published",
      sortOrder: 1,
      content: JSON.stringify([
        {
          type: "paragraph",
          content: "Dies ist eine Beispielseite. Bearbeiten Sie sie im Admin-Panel unter Seiten.",
        },
      ]),
    },
  });
  console.log(`Created sample page: ${page.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
