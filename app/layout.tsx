import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TactiQ — Football Formation Predictions on Celo",
  description:
    "Stake USDm on football formation predictions. Get free AI tactical tips powered by Gemini. Win from the prize pool. Built on Celo for MiniPay.",
  openGraph: {
    title: "TactiQ",
    description: "AI football formation prediction market on Celo. Stake USDm, get free Gemini tactical tips, win from the prize pool.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
