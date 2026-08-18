import Ticker from "@/components/layout/Ticker";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Everything under the (site) group gets the public-facing chrome
// (ticker + navbar + footer). Dashboard routes live outside this group
// so they render full-screen without the public header/footer.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ticker />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
