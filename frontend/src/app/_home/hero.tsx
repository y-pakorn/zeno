import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function Hero() {
  return (
    <div className="grid h-[300px] grid-cols-2 gap-4">
      <div className="flex flex-col justify-center gap-4">
        <h1 className="font-heading text-4xl font-bold">
          Start trading
          <br />
          Pre-market on <span className="text-brand">Zeno</span> now
        </h1>
        <Button className="w-[200px]">
          Trade Now <ArrowRight />
        </Button>
      </div>
      <Skeleton className="size-full" />
    </div>
  )
}
