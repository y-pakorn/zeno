import { useQuery, UseQueryOptions } from "@tanstack/react-query"

import { AllEventItem } from "@/types/order"
import { useNetwork } from "@/components/wallet-provider"

export function useAllEvents({
  ...options
}: Partial<UseQueryOptions<AllEventItem[]>> = {}) {
  const { network } = useNetwork()
  return useQuery({
    queryKey: ["all-events", network],
    queryFn: async () => {
      const response = await fetch(`/api/all-events?network=${network}`)
      return response.json().then((data) => data.data)
    },
    staleTime: 900 * 1000, // 15 minutes
    ...options,
  })
}
