import { HermesClient } from "@pythnetwork/hermes-client"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { BigNumber } from "bignumber.js"
import _ from "lodash"

import { Collateral, PreMarket } from "@/types/market"

const connection = new HermesClient("https://hermes.pyth.network", {}) // See Hermes endpoints section below for other endpoints

type CollateralPrices = Record<string, BigNumber>

export function useCollateralPrices({
  market,
  ...props
}: {
  market: PreMarket
} & Partial<UseQueryOptions<CollateralPrices>>) {
  return useQuery<CollateralPrices>({
    queryKey: [
      "collateral-prices",
      _.chain(market.collaterals).map("pythId").sort().value(),
    ],
    queryFn: async () => {
      const prices = await connection
        .getLatestPriceUpdates(
          market.collaterals.map((collateral) => collateral.pythId),
          {
            parsed: true,
            ignoreInvalidPriceIds: true,
          }
        )
        .then((d) =>
          _.fromPairs(
            d.parsed?.map((p) => [
              market.collaterals.find((c) => c.pythId === `0x${p.id}`)
                ?.coinType,
              new BigNumber(p.price.price).shiftedBy(p.price.expo),
            ])
          )
        )

      return prices
    },
    ...props,
  })
}
