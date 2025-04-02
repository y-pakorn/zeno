"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import BigNumber from "bignumber.js"
import _ from "lodash"
import { ExternalLink } from "lucide-react"

import { AllEventItem } from "@/types/order"
import { dayjs } from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { useAllEvents } from "@/hooks/use-all-events"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import { useNetwork } from "@/components/wallet-provider"

export function AllEvents() {
  const { data, isLoading } = useAllEvents()
  const {
    networkConfig: { explorerUrl },
  } = useNetwork()

  const columns: ColumnDef<AllEventItem>[] = useMemo(() => {
    return [
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
        header: "Market",
        accessorKey: "market",
        cell: ({ getValue }) => {
          const market = getValue<{
            id: string
            icon: string
            ticker: string
          }>()
          return (
            <Link
              href={`/markets/${market.id}`}
              className="flex items-center gap-2"
            >
              <img
                src={market.icon}
                alt={market.ticker}
                className="size-4 rounded-full"
              />
              <span className="font-medium">{market.ticker}</span>
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
        header: "Amount",
        accessorFn: (row) =>
          new BigNumber(row.collateral.amount)
            .multipliedBy(row.rate)
            .toFormat(4),
        cell: ({ getValue }) => {
          const amount = getValue<string>()
          return <span className="text-muted-foreground">{amount}</span>
        },
      },
      {
        header: "Collateral",
        accessorKey: "collateral",
        cell: ({ getValue }) => {
          const collateral = getValue<{
            icon: string
            ticker: string
            amount: string
          }>()
          return (
            <div className="flex items-center gap-2">
              <span>{new BigNumber(collateral.amount).toFormat(4)}</span>
              <img
                src={collateral.icon}
                alt={collateral.ticker}
                className="size-4 rounded-full"
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
    ]
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">All Transactions</h2>
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoadingSkeleton={isLoading}
        skeletonCount={10}
        rowClassName={() => cn("h-12")}
      />
    </div>
  )
}
