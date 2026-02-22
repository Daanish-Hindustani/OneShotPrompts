import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "OneShotPrompts",
  description: "One-shot plans for production apps"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
