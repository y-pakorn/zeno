import { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import BigNumber from "bignumber.js"
import _ from "lodash"
import { ChevronDown } from "lucide-react"

import { Collateral } from "@/types/market"
import { Offer, OpenOrder } from "@/types/order"
import { cn, formatBigNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DataTable } from "@/components/data-table"

import { useMarket } from "./market-provider"
import { useOrder } from "./order-provider"

export function CollateralDisplay({
  collateral,
}: {
  collateral: Collateral | undefined
}) {
  if (!collateral) return "All Collaterals"
  return (
    <div className="flex items-center gap-2">
      <img src={collateral.icon} alt={collateral.ticker} className="size-4" />
      {collateral.ticker}
    </div>
  )
}

export function OfferSection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { filters, setFilters, market } = useMarket()

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <h2 className="font-heading text-2xl font-bold">Offers</h2>
      <div className="flex items-center gap-4">
        <ToggleGroup
          variant="outline"
          type="single"
          value={filters.type}
          onValueChange={(value) =>
            setFilters({ ...filters, type: value as "all" | "buy" | "sell" })
          }
          size="lg"
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="buy">Buy</ToggleGroupItem>
          <ToggleGroupItem value="sell">Sell</ToggleGroupItem>
        </ToggleGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="ml-auto"
              rounded="full"
            >
              <CollateralDisplay
                collateral={market.collaterals.find(
                  (collateral) => collateral?.coinType === filters.collateral
                )}
              />
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[undefined, ...market.collaterals].map((collateral) => (
              <DropdownMenuItem
                key={collateral?.coinType || "all"}
                onClick={() =>
                  setFilters({ ...filters, collateral: collateral?.coinType })
                }
              >
                <CollateralDisplay collateral={collateral} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg" rounded="full">
              {filters.fillType || "All Fill Types"}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              {
                label: "All Fill Types",
                value: undefined,
              },
              {
                label: "Partial Fill",
                value: "Partial",
              },
              {
                label: "Full Fill",
                value: "Full",
              },
            ].map((fillType) => (
              <DropdownMenuItem
                key={fillType.label}
                onClick={() =>
                  setFilters({
                    ...filters,
                    fillType: fillType.value as "full" | "partial" | undefined,
                  })
                }
              >
                {fillType.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>
      <OfferTable />
    </div>
  )
}

function OfferTable() {
  const { offers, market, collateralPrices, filters } = useMarket()
  const { selectOrder, selectedOrderIds, unselectOrder } = useOrder()

  const columns: ColumnDef<Offer>[] = useMemo(
    () => [
      {
        header: "Price ($)",
        accessorKey: "price",
        cell: ({ getValue }) => {
          const price = getValue<BigNumber>()
          return <div className="font-medium">${formatBigNumber(price)}</div>
        },
      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: ({ getValue }) => {
          const amount = getValue<BigNumber>()
          return (
            <div className="text-muted-foreground">
              {formatBigNumber(amount)}
            </div>
          )
        },
      },
      {
        header: "Collateral",
        accessorKey: "collateral",
        cell: ({ getValue }) => {
          const collateral = getValue<Offer["collateral"]>()
          return (
            <div className="flex items-center gap-2 font-medium">
              {formatBigNumber(collateral.amount)}
              <img
                src={collateral.icon}
                alt="Icon"
                className="size-4 shrink-0 rounded-full"
              />
            </div>
          )
        },
      },
      // {
      //   header: "Fill Type",
      //   accessorKey: "fillType",
      //   cell: ({ getValue }) => {
      //     const fillType = getValue<Offer["fillType"]>()
      //     return (
      //       <Badge variant={fillType === "full" ? "brandOutline" : "outline"}>
      //         {_.startCase(fillType)}
      //       </Badge>
      //     )
      //   },
      // },
      {
        header: "Action",
        accessorKey: "type",
        cell: ({ getValue, row }) => {
          const type = getValue<Offer["type"]>()
          const selected = selectedOrderIds.has(row.original.id)
          return (
            <Button
              variant="ghost"
              size="xs"
              className={cn(
                type === "buy" ? "text-error" : "text-success",
                selected && "text-primary"
              )}
              onClick={() => {
                if (selected) {
                  unselectOrder(row.original.id)
                } else {
                  selectOrder(row.original.id)
                }
              }}
            >
              {selected ? "Cancel" : type === "buy" ? "Sell" : "Buy"}
            </Button>
          )
        },
      },
    ],
    [selectedOrderIds, selectOrder, unselectOrder]
  )

  return (
    <div className="grid grid-cols-2 gap-2">
      <DataTable
        className={cn(
          filters.type !== "buy" ? "col-span-2" : "hidden",
          filters.type === "all" && "col-span-1"
        )}
        columns={columns}
        data={offers.shownSell}
        transparent
        rowClassName={(row) => {
          const offer = row.original as Offer
          return cn(
            selectedOrderIds.has(offer.id) && "bg-brand/5 hover:bg-brand/10"
          )
        }}
      />
      <DataTable
        className={cn(
          filters.type !== "sell" ? "col-span-2" : "hidden",
          filters.type === "all" && "col-span-1"
        )}
        columns={columns}
        data={offers.shownBuy}
        transparent
        rowClassName={(row) => {
          const offer = row.original as Offer
          return cn(
            selectedOrderIds.has(offer.id) && "bg-brand/5 hover:bg-brand/10"
          )
        }}
      />
    </div>
  )
}
