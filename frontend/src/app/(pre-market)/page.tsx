import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  )
}
