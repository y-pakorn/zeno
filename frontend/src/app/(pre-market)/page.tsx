"use client"

import { NAVBAR_HEIGHT } from "@/components/app-navbar"

import { BookProvider } from "./book-provider"
import { BANNER_HEIGHT, MarketBanner } from "./market-banner"
import { MarketHeader } from "./market-header"
import { OfferSection } from "./offer-section"
import { OrderProvider } from "./order-provider"
import { OrderSection } from "./order-section"

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
          <div className="flex gap-4">
            <OfferSection className="w-full" />
            <OrderSection />
          </div>
        </div>
      </OrderProvider>
    </BookProvider>
  )
}
