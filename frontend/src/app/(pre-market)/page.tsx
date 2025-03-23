"use client"

import { NAVBAR_HEIGHT } from "@/components/app-navbar"

import { BookProvider } from "./book-provider"
import { BANNER_HEIGHT, MarketBanner } from "./market-banner"
import { MarketHeader } from "./market-header"
import { OfferSection } from "./offer-section"
import { OrderProvider } from "./order-provider"
import { OrderSection } from "./order-section"
import { RecentTransactionSection } from "./recent-transaction-section"

export default function Home() {
  return (
    <BookProvider>
      <OrderProvider>
        <MarketBanner />
        <div
          className="space-y-4 py-4"
          style={{
            marginTop: `calc(${BANNER_HEIGHT} - ${NAVBAR_HEIGHT} - 2rem)`,
          }}
        >
          <MarketHeader />
          <div className="flex h-[730px] gap-4">
            <OfferSection />
            <OrderSection />
          </div>
          <RecentTransactionSection />
        </div>
      </OrderProvider>
    </BookProvider>
  )
}
