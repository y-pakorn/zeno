"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import BigNumber from "bignumber.js"
import dayjs from "dayjs"
import _ from "lodash"
import { ExternalLink } from "lucide-react"

import { FilledOrder } from "@/types/order"
import { cn, formatAddress } from "@/lib/utils"
import { useFilledOrderEvents } from "@/hooks/use-order-events"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { useMarket } from "@/components/market-provider"
import { useNetwork } from "@/components/wallet-provider"

export function RecentTransactionSection() {
  const { market, collateralPrices } = useMarket()
  const { data: filledOrders, isLoading } = useFilledOrderEvents({
    market,
    refetchInterval: 11 * 1000, // 11 seconds
  })
  const {
    networkConfig: { explorerUrl },
  } = useNetwork()

  const columns: ColumnDef<FilledOrder>[] = useMemo(
    () => [
      {
        header: "Timestamp",
        accessorKey: "filledAt",
        cell: ({ getValue }) => {
          const filledAt = getValue<Date>()
          return (
            <span className="text-muted-foreground">
              {dayjs(filledAt).format("MM/DD/YYYY HH:mm:ss")}
            </span>
          )
        },
      },
      {
        header: "Maker",
        accessorKey: "maker",
        cell: ({ getValue }) => {
          const maker = getValue<string>()
          return (
            <Link
              href={`${explorerUrl}/address/${maker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              {formatAddress(maker)} <ExternalLink className="size-3" />
            </Link>
          )
        },
      },
      {
        header: "Taker",
        accessorKey: "taker",
        cell: ({ getValue }) => {
          const taker = getValue<string>()
          return (
            <Link
              href={`${explorerUrl}/address/${taker}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              {formatAddress(taker)} <ExternalLink className="size-3" />
            </Link>
          )
        },
      },
      {
        header: "Type",
        accessorKey: "type",
        cell: ({ getValue }) => {
          const type = getValue<"buy" | "sell">()
          return (
            <Badge variant={type === "buy" ? "success" : "error"}>
              {_.startCase(type)}
            </Badge>
          )
        },
      },
      {
        header: "Price",
        accessorKey: "rate",
        cell: ({ getValue, row }) => {
          const rate = getValue<BigNumber>()
          const collateral = row.original.collateral.coinType
          return (
            <span>
              $
              {rate
                .multipliedBy(collateralPrices.data?.[collateral] || 0)
                .toFormat(4)}
            </span>
          )
        },
      },
      {
        header: "Collateral",
        accessorKey: "collateral",
        cell: ({ getValue }) => {
          const collateral = getValue<FilledOrder["collateral"]>()
          return (
            <div className="flex items-center gap-2">
              <span>{collateral.amount.toFormat(4)}</span>
              <img
                src={collateral.icon}
                alt={collateral.ticker}
                className="size-4"
              />
            </div>
          )
        },
      },
      {
        header: "Tx Hash",
        accessorKey: "transaction.hash",
        cell: ({ getValue }) => {
          const hash = getValue<string>()
          return (
            <Link
              href={`${explorerUrl}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <span className="max-w-16 truncate">{hash}</span>{" "}
              <ExternalLink className="size-3" />
            </Link>
          )
        },
      },
    ],
    [explorerUrl, collateralPrices.data]
  )

  return (
    <div className="space-y-2">
      <h2 className="font-heading text-2xl font-bold">Recent Transactions</h2>
      <DataTable
        columns={columns}
        data={filledOrders || []}
        isLoadingSkeleton={isLoading}
        skeletonCount={10}
        rowClassName={() => cn("h-12")}
      />
    </div>
  )
}
