import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/lib/i18n/provider";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const body = Manrope({ variable: "--font-body", subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"], display: "swap" });
const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Asterra", template: "%s · Asterra" },
  description: "A collaborative platform for scientific projects: create research, find collaborators and plan with AI.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={`${body.variable} ${display.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <LocaleProvider locale={locale}>
            {children}
            <Toaster position="top-right" />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
