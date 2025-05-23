import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

import { AllEvents } from "./all-events"
import { NewListings } from "./new-listings"
import { UpcomingMarkets } from "./upcoming-markets"

export default function Home() {
  return (
    <>
      <div className="absolute top-0 right-1/2 left-1/2 z-[-1] -mr-[50vw] -ml-[50vw] h-[400px] w-full bg-[url('/assets/background.webp')] bg-cover bg-bottom opacity-50" />
      <div className="space-y-8 py-4">
        <div className="grid gap-4 py-8 md:grid-cols-2">
          <div className="space-y-4">
            <h1 className="font-heading text-5xl font-bold">
              Trade Pre-Market Crypto Assets on{" "}
              <span className="text-brand">Zeno</span> Decentralized & Instant
            </h1>
            <p className="text-muted-foreground">
              Access pre-launch token markets with full decentralization. Create
              and accept offers peer-to-peer, with transparent.
            </p>
            <Link href="/markets">
              <Button variant="brand" size="lg">
                Explore Pre-Markets <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
        <NewListings />
        <UpcomingMarkets />
        <AllEvents />
      </div>
    </>
  )
}
