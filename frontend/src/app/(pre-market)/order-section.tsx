import { useState } from "react"
import { ChevronLeft, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

import { MakerOrder } from "./maker-order"
import { TakerOrder } from "./taker-order"

export const ORDER_SECTION_WIDTH = "330px"

export function OrderSection() {
  const [isTaker, setIsTaker] = useState(true)

  return (
    <div
      className="shrink-0 space-y-2 rounded-2xl border p-4"
      style={{ width: ORDER_SECTION_WIDTH }}
    >
      {!isTaker ? (
        <>
          <Button
            variant="ghostSubtle"
            size="sm"
            onClick={() => setIsTaker(true)}
          >
            <ChevronLeft /> Back
          </Button>
          <MakerOrder />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Review Order</h2>
            <Button
              variant="brand"
              rounded="full"
              size="sm"
              onClick={() => setIsTaker(false)}
            >
              New Offer <Plus />
            </Button>
          </div>
          <TakerOrder />
        </>
      )}
    </div>
  )
}
