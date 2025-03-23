import BigNumber from "bignumber.js"

export type PreMarket = {
  id: string
  marketId: string
  packageId: string
  name: string
  ticker: string
  icon: string
  banner?: string
  isLive: boolean
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
