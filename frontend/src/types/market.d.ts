import BigNumber from "bignumber.js"

import { Network } from "@/config/network"

export type Market = PreMarket | UpcomingMarket

export type PreMarket = {
  network: Network
  id: string
  marketId: string
  packageId: string
  name: string
  ticker: string
  icon: string
  status: "live"
  totalSupply: number
  collaterals: Collateral[]
  resolution?: Resolution
  links?: {
    twitter?: string
    discord?: string
    website?: string
  }
  fee: MarketFee
}

export type UpcomingMarket = {
  network: Network
  id: string
  name: string
  ticker: string
  icon: string
  status: "upcoming"
  links?: {
    twitter?: string
    discord?: string
    website?: string
  }
}

export type MarketFee = {
  buyer: number
  seller: number
  cancel: number
  penalty: number
}

export type Collateral = {
  coinType: string
  ticker: string
  icon: string
  minimumAmount: number
  exponent: number
  pythId: string
}

export type Resolution = {
  settlementStart: Date
  deliveryBefore: Date
  finalCoinType?: string
  exponent?: number
}

export type OnchainMarket = {
  id: string
  openOrdersBagId: string
  totalOpenOrders: number
  filledOrdersBagId: string
  totalFilledOrders: number
  settledOrdersBagId: string
  totalSettledOrders: number
  orderOwnerTableId: string
  collateral: Record<
    string,
    {
      volumeCancelled: BigNumber
      volumeFilled: BigNumber
      volumeOpened: BigNumber
    }
  >
  stats: {
    cancelled: number
    filled: number
    settled: number
    opened: number
    claimed: number
    closed: number
  }
}
