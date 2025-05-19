import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"
import { Instrument_Sans } from "next/font/google"
import localFont from "next/font/local"
import { GoogleAnalytics } from "@next/third-parties/google"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { AppNavbar } from "@/components/app-navbar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/wallet-provider"

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const heading = localFont({
  src: [
    {
      path: "./Satoshi-Variable.ttf",
    },
    {
      path: "./Satoshi-VariableItalic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url.base),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.author,
      url: siteConfig.url.author,
    },
  ],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url.base,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitter,
  },
  icons: {
    icon: siteConfig.logo,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "bg-background font-heading relative min-h-screen antialiased",
          heading.className,
          heading.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <WalletProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="w-full">
                <div className="container flex min-h-screen flex-col">
                  <AppNavbar />
                  {children}
                </div>
              </main>
            </SidebarProvider>
          </WalletProvider>
          <Toaster />
        </ThemeProvider>
      </body>
      {env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
