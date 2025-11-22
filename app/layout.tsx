import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Contract IQ",
  description: "Analyze contract quality and detect airdrop farming on Base network",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "Base Contract IQ",
    description: "Analyze contract quality and detect airdrop farming on Base network",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
