"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import _ from "lodash"
import { ArrowDown, ArrowUpRight, ExternalLinkIcon } from "lucide-react"
import { match } from "ts-pattern"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"

const data: TransactionProps[] = [
  {
    id: "1",
    timestamp: "2024-01-01 12:00:00",
    token: {
      name: "INIT",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/INIT.svg",
    },
    type: "buy",
    side: "maker",
    market: "premarket",
    price: 1.32,
    amount: 1,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 1.32,
    },
    txhash: "0x1234567890abcdef",
  },
  {
    id: "2",
    timestamp: "2024-01-01 11:58:32",
    token: {
      name: "PAWS",
      icon: "https://s3-alpha-sig.figma.com/img/9492/c6b3/cc523ae0278c7f371a97168679516a35?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=U6Ig4RP~-B9oM9vDZBORZ3XssOnkys-RM9TA4f9R6C0obcnRSQp7aKlYxmGVfwHkVRlEO~mJU8ZEwjE37eruibGHJ9q~Hsyh9319CoOFR2MIklLk3nld9H0DQxmeJVWh26~x81wSylglhN~c7v-67p7OkLK1KV0cjPXpaiDR5SJTIzapMWqIcbqtzn8maKZwsSn4WQdiMWTj2h48U6R8S87BDrESsNTECtjUHGUOj~qUNmxVAZzNfJ-X0VH1XSbccKAOCJFlCD5JKiykRQRF7f4ySfA~qEYaWNAI7OC3h1J4uOPYBA3wjeVEiRGQ2du5LT3z2GI6X5E9hTvx2Niv0g__",
    },
    type: "sell",
    side: "taker",
    market: "premarket",
    price: 0.00051,
    amount: 1000,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 0.51,
    },
    txhash: "0x2345678901bcdef0",
  },
  {
    id: "3",
    timestamp: "2024-01-01 11:55:14",
    token: {
      name: "KAMI",
      icon: "https://registry.testnet.initia.xyz/yominet/images/kamigochi.png",
    },
    type: "buy",
    side: "maker",
    market: "premarket",
    price: 0.85,
    amount: 5,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 4.25,
    },
    txhash: "0x3456789012cdef01",
  },
  {
    id: "4",
    timestamp: "2024-01-01 11:52:45",
    token: {
      name: "INIT",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/INIT.svg",
    },
    type: "sell",
    side: "maker",
    market: "premarket",
    price: 1.31,
    amount: 2,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 2.62,
    },
    txhash: "0x456789012def0123",
  },
  {
    id: "5",
    timestamp: "2024-01-01 11:50:22",
    token: {
      name: "PAWS",
      icon: "https://s3-alpha-sig.figma.com/img/9492/c6b3/cc523ae0278c7f371a97168679516a35?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=U6Ig4RP~-B9oM9vDZBORZ3XssOnkys-RM9TA4f9R6C0obcnRSQp7aKlYxmGVfwHkVRlEO~mJU8ZEwjE37eruibGHJ9q~Hsyh9319CoOFR2MIklLk3nld9H0DQxmeJVWh26~x81wSylglhN~c7v-67p7OkLK1KV0cjPXpaiDR5SJTIzapMWqIcbqtzn8maKZwsSn4WQdiMWTj2h48U6R8S87BDrESsNTECtjUHGUOj~qUNmxVAZzNfJ-X0VH1XSbccKAOCJFlCD5JKiykRQRF7f4ySfA~qEYaWNAI7OC3h1J4uOPYBA3wjeVEiRGQ2du5LT3z2GI6X5E9hTvx2Niv0g__",
    },
    type: "buy",
    side: "taker",
    market: "premarket",
    price: 0.00052,
    amount: 2000,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 1.04,
    },
    txhash: "0x56789012def01234",
  },
  {
    id: "6",
    timestamp: "2024-01-01 11:48:03",
    token: {
      name: "KAMI",
      icon: "https://registry.testnet.initia.xyz/yominet/images/kamigochi.png",
    },
    type: "sell",
    side: "maker",
    market: "premarket",
    price: 0.84,
    amount: 3,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 2.52,
    },
    txhash: "0x6789012def012345",
  },
  {
    id: "7",
    timestamp: "2024-01-01 11:45:56",
    token: {
      name: "INIT",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/INIT.svg",
    },
    type: "buy",
    side: "taker",
    market: "premarket",
    price: 1.33,
    amount: 1.5,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 1.995,
    },
    txhash: "0x789012def0123456",
  },
  {
    id: "8",
    timestamp: "2024-01-01 11:43:21",
    token: {
      name: "PAWS",
      icon: "https://s3-alpha-sig.figma.com/img/9492/c6b3/cc523ae0278c7f371a97168679516a35?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=U6Ig4RP~-B9oM9vDZBORZ3XssOnkys-RM9TA4f9R6C0obcnRSQp7aKlYxmGVfwHkVRlEO~mJU8ZEwjE37eruibGHJ9q~Hsyh9319CoOFR2MIklLk3nld9H0DQxmeJVWh26~x81wSylglhN~c7v-67p7OkLK1KV0cjPXpaiDR5SJTIzapMWqIcbqtzn8maKZwsSn4WQdiMWTj2h48U6R8S87BDrESsNTECtjUHGUOj~qUNmxVAZzNfJ-X0VH1XSbccKAOCJFlCD5JKiykRQRF7f4ySfA~qEYaWNAI7OC3h1J4uOPYBA3wjeVEiRGQ2du5LT3z2GI6X5E9hTvx2Niv0g__",
    },
    type: "sell",
    side: "maker",
    market: "premarket",
    price: 0.00051,
    amount: 1500,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 0.765,
    },
    txhash: "0x89012def01234567",
  },
  {
    id: "9",
    timestamp: "2024-01-01 11:40:44",
    token: {
      name: "KAMI",
      icon: "https://registry.testnet.initia.xyz/yominet/images/kamigochi.png",
    },
    type: "buy",
    side: "maker",
    market: "premarket",
    price: 0.85,
    amount: 4,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 3.4,
    },
    txhash: "0x9012def012345678",
  },
  {
    id: "10",
    timestamp: "2024-01-01 11:38:12",
    token: {
      name: "INIT",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/INIT.svg",
    },
    type: "sell",
    side: "taker",
    market: "premarket",
    price: 1.32,
    amount: 2.5,
    collateral: {
      name: "USDC",
      icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/USDC.svg",
      amount: 3.3,
    },
    txhash: "0x012def0123456789",
  },
]

interface TransactionProps {
  id: string
  timestamp: string
  token: {
    name: string
    icon: string
  }
  type: "buy" | "sell"
  side: "maker" | "taker"
  market: "premarket"
  price: number
  amount: number
  collateral: {
    name: string
    icon: string
    amount: number
  }
  txhash: string
}

const columns: ColumnDef<TransactionProps>[] = [
  {
    header: "Timestamp",
    accessorKey: "timestamp",
    cell: ({ getValue }) => {
      return <div className="text-muted-foreground">{getValue<string>()}</div>
    },
  },
  {
    header: "Market",
    accessorKey: "token",
    cell: ({ getValue }) => {
      const token = getValue<TransactionProps["token"]>()
      return (
        <div className="flex items-center gap-2 font-semibold">
          <img
            src={token.icon}
            alt={token.name}
            className="size-5 shrink-0 rounded-full"
          />
          {token.name}
        </div>
      )
    },
  },
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ getValue }) => {
      const type = getValue<TransactionProps["type"]>()
      return match(type)
        .with("buy", () => <Badge variant="success">Buy</Badge>)
        .with("sell", () => <Badge variant="error">Sell</Badge>)
        .exhaustive()
    },
  },
  {
    header: "Side",
    accessorKey: "side",
    cell: ({ getValue }) => {
      const side = getValue<TransactionProps["side"]>()
      return <Badge variant="outline">{_.startCase(side)}</Badge>
    },
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ getValue }) => {
      const price = getValue<number>()
      return <div className="font-medium">${price.toFixed(2)}</div>
    },
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ getValue }) => {
      const amount = getValue<number>()
      return <div className="text-muted-foreground">{amount.toFixed(2)}</div>
    },
  },
  {
    header: "Collateral",
    accessorKey: "collateral",
    cell: ({ getValue }) => {
      const collateral = getValue<TransactionProps["collateral"]>()
      return (
        <div className="flex items-center gap-2 font-semibold">
          <img
            src={collateral.icon}
            alt={collateral.name}
            className="size-5 shrink-0 rounded-full"
          />
          {collateral.amount.toFixed(2)} {collateral.name}
        </div>
      )
    },
  },
  {
    header: "Tx Hash",
    accessorKey: "txhash",
    cell: ({ getValue }) => {
      const txhash = getValue<string>()
      return (
        <Link
          href={`https://suiscan.xyz/tx/${txhash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghostSubtle" size="icon">
            <ArrowUpRight />
          </Button>
        </Link>
      )
    },
  },
]

export function RecentTransaction() {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Recent Transactions</h2>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
