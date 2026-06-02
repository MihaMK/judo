import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Џудо клуб",
  description: "Оперативен систем за управување со натпреварувачки џудо клуб"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk">
      <body>{children}</body>
    </html>
  );
}
