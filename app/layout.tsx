import type { Metadata } from "next";
import { Inter, Merriweather, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather", display: "swap" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DocuFlow — Text to PDF Studio",
    template: "%s — DocuFlow",
  },
  description:
    "Convert raw text and Markdown into professional, vector-quality PDFs. Live preview, executive themes, page setup, watermarks. 100% client-side — your text never leaves the browser.",
  keywords: ["text to pdf", "markdown to pdf", "pdf converter", "document studio", "print to pdf", "client-side pdf"],
  authors: [{ name: "DocuFlow" }],
  creator: "DocuFlow",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "DocuFlow",
    title: "DocuFlow — Text to PDF Studio",
    description:
      "Paste text or Markdown, style it with pro themes, and export a selectable, searchable vector PDF. Private by design.",
  },
  twitter: {
    card: "summary",
    title: "DocuFlow — Text to PDF Studio",
    description: "Raw text in, professional PDF out. 100% client-side.",
  },
};

export function generateViewport() {
  return { width: "device-width", initialScale: 1, themeColor: "#4f46e5" };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
