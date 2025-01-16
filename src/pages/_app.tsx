import "@/styles/globals.css";
import type { AppProps } from "next/app";
import localFont from "next/font/local";
import { SessionProvider } from "next-auth/react";

// Load HTWBerlinOffice font family
const htwBerlinOffice = localFont({
  src: [
    {
      path: "../fonts/HTWBerlinOffice-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/HTWBerlinOffice-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/HTWBerlinOffice-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/HTWBerlinOffice-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-htw",
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <main className={`${htwBerlinOffice.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
