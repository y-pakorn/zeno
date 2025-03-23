import { memo, useMemo, useState } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
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

import { useBook } from "./book-provider"
import { useMarket } from "./market-provider"
import { useOrder } from "./order-provider"

type Filter = {
  type: "buy" | "sell" | "all"
  collateral?: string
  fillType?: "full" | "partial"
}

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
  const { market } = useMarket()

  const [filters, setFilters] = useState<Filter>({
    type: "all",
    collateral: undefined,
    fillType: undefined,
  })

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
          className="*:px-6"
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
      <OfferTable filters={filters} />
    </div>
  )
}

const OfferTable = memo(function OfferTable({ filters }: { filters: Filter }) {
  const { offers } = useBook()
  const { selectOrder, selectedOrderIds, unselectOrder } = useOrder()

  const { buy, sell } = useMemo(() => {
    return {
      buy: _.chain(offers)
        .filter((o) => o.type === "buy")
        .filter((o) =>
          filters.collateral
            ? o.collateral.coinType === filters.collateral
            : true
        )
        .filter((o) =>
          filters.fillType ? o.fillType === filters.fillType : true
        )
        .sortBy((p) => -p.price)
        .value(),
      sell: _.chain(offers)
        .filter((o) => o.type === "sell")
        .filter((o) =>
          filters.collateral
            ? o.collateral.coinType === filters.collateral
            : true
        )
        .filter((o) =>
          filters.fillType ? o.fillType === filters.fillType : true
        )
        .sortBy((p) => p.price)
        .value(),
    }
  }, [offers, filters])

  const account = useCurrentAccount()

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
                account?.address === row.original.by
                  ? false
                  : type === "buy"
                    ? "text-error"
                    : "text-success",
                selected && "text-primary"
              )}
              disabled={account?.address === row.original.by}
              onClick={() => {
                if (!account) return
                if (selected) {
                  unselectOrder(row.original.id)
                } else {
                  selectOrder(row.original.id)
                }
              }}
            >
              {account?.address === row.original.by
                ? "My Order"
                : selected
                  ? "Cancel"
                  : type === "buy"
                    ? "Sell"
                    : "Buy"}
            </Button>
          )
        },
      },
    ],
    [selectedOrderIds, selectOrder, unselectOrder, account?.address]
  )

  return (
    <div className="grid grid-cols-2 gap-2">
      <DataTable
        className={cn(
          filters.type !== "buy" ? "col-span-2" : "hidden",
          filters.type === "all" && "col-span-1"
        )}
        columns={columns}
        data={sell}
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
        data={buy}
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
})
