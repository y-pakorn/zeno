export type HistoricalPrice = {
  period: Date
  avg: number
  min: number
  max: number
  volume: number
  count: number
}

export type HistoricalPrices = {
  [coinType: string]: HistoricalPrice[]
}
