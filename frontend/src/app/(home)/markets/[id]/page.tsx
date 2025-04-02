import { CalendarClock, CircleHelp } from "lucide-react"

import { markets } from "@/config/market"
import { BookProvider } from "@/components/book-provider"
import { EmptyState } from "@/components/empty-state"
import { MarketProvider } from "@/components/market-provider"
import { OrderProvider } from "@/components/order-provider"

import { MarketHeader } from "./market-header"
import { OfferSection } from "./offer-section"
import { OrderSection } from "./order-section"
import { RecentTransactionSection } from "./recent-transaction-section"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const market = markets.find((market) => market.id === id)
  if (!market) {
    return {
      title: "Market not found",
    }
  }
  return {
    title: `${market.name}`,
  }
}

export default async function MarketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const market = markets.find((market) => market.id === id)

  if (!market) {
    return (
      <EmptyState
        icon={CircleHelp}
        header="Market not found"
        description="Please check the market ID and try again."
      />
    )
  }

  if (market.status === "upcoming") {
    return (
      <EmptyState
        icon={CalendarClock}
        header="Upcoming Market"
        description="This market is not yet live. Please check back later."
      />
    )
  }

  return (
    <MarketProvider market={market}>
      <BookProvider>
        <OrderProvider>
          <div className="space-y-4 py-4">
            <MarketHeader />
            <div className="flex h-[730px] gap-4">
              <OfferSection />
              <OrderSection />
            </div>
            <RecentTransactionSection />
          </div>
        </OrderProvider>
      </BookProvider>
    </MarketProvider>
  )
}
