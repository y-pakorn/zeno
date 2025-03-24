import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { useNetwork } from "@/components/wallet-provider"

export const useSignAndExecute = () => {
  const { networkConfig } = useNetwork()
  const client = useSuiClient()

  const signAndExecute = useSignAndExecuteTransaction({
    onSuccess: async (tx) => {
      const txResult = await client.waitForTransaction({
        digest: tx.digest,
        options: {
          showEffects: true,
        },
      })

      if (txResult.effects?.status.status === "success") {
        toast.success(`Transaction Success`, {
          description: tx.digest,
          action: {
            label: <ExternalLink className="size-4" />,
            onClick: () => {
              window.open(
                `${networkConfig.explorerUrl}/tx/${tx.digest}`,
                "_blank"
              )
            },
          },
        })
      } else {
        toast.error("Transaction Failed", {
          description: txResult.effects?.status.error,
        })
      }
    },
    onError: (error) => {
      toast.error("Transaction Failed", {
        description: error.message,
      })
    },
  })
  return signAndExecute
}
