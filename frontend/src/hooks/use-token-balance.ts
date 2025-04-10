import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { CoinBalance } from "@mysten/sui/client"
import { QueryClient, useQuery, UseQueryOptions } from "@tanstack/react-query"

export const triggerUpdateTokenBalance = (
  queryClient: QueryClient,
  coinType: string,
  accountAddress?: string
) => {
  return queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "token-balance" &&
      query.queryKey[1] === coinType &&
      accountAddress
        ? query.queryKey[2] === accountAddress
        : true,
  })
}

export const useTokenBalance = ({
  coinType,
  enabled,
  ...options
}: {
  coinType: string
} & Partial<UseQueryOptions<CoinBalance>>) => {
  const client = useSuiClient()
  const account = useCurrentAccount()
  return useQuery({
    queryKey: ["token-balance", coinType, account?.address],
    queryFn: async () => {
      if (!account?.address) throw new Error("No account found")
      const balance = await client.getBalance({
        owner: account?.address,
        coinType,
      })
      return balance
    },
    enabled: !!account?.address && enabled === undefined ? true : enabled,
    ...options,
  })
}
