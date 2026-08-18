import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Shikka Nepal | तपाईंको भरपर्दो आर्थिक समाचार",
  description: "नेपालको आर्थिक, वित्तीय र व्यापारिक जगतका भरपर्दो समाचार, एक ठाउँमा।",
};

// Intentionally minimal: the public site chrome (ticker/navbar/footer) lives
// in src/app/(site)/layout.tsx, and the dashboard renders its own sidebar +
// topbar in src/app/dashboard/**/layout.tsx. Keeping this root layout bare
// means dashboard pages never inherit the public header/footer.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ne" className={`${notoSansDevanagari.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
