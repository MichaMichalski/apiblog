import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Zum Inhalt springen
      </a>
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
