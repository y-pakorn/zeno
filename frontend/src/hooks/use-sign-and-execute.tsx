import { useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { useNetwork } from "@/components/wallet-provider"

export const useSignAndExecute = () => {
  const { networkConfig } = useNetwork()
  const signAndExecute = useSignAndExecuteTransaction({
    onSuccess: (tx) => {
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
    },
    onError: (error) => {
      toast.error("Transaction Failed", {
        description: error.message,
      })
    },
  })
  return signAndExecute
}
