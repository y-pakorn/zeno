"use client"

import { ComponentProps, useState } from "react"
import Link from "next/link"
import {
  ConnectModal,
  useAccounts,
  useCurrentAccount,
  useDisconnectWallet,
  useSuiClient,
  useSuiClientContext,
  useSwitchAccount,
} from "@mysten/dapp-kit"
import { requestSuiFromFaucetV0 } from "@mysten/sui/faucet"
import { Transaction } from "@mysten/sui/transactions"
import type { WalletAccount } from "@mysten/wallet-standard"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  Copy,
  Droplets,
  ExternalLink,
  Loader2,
  LogOut,
  PieChart,
} from "lucide-react"
import { toast } from "sonner"

import { cn, formatAddress } from "@/lib/utils"
import { useSignAndExecute } from "@/hooks/use-sign-and-execute"
import { triggerUpdateTokenBalance } from "@/hooks/use-token-balance"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useNetwork } from "./wallet-provider"

export function WalletButton({
  ...props
}: React.ComponentProps<typeof Button>) {
  const currentAccount = useCurrentAccount()

  if (currentAccount) {
    return (
      <ConnectedWalletButtonContent
        currentAccount={currentAccount}
        {...props}
      />
    )
  }

  return <WalletButtonContent {...props} />
}

function ConnectedWalletButtonContent({
  currentAccount,
  className,
  ...props
}: {
  currentAccount: WalletAccount
} & ComponentProps<typeof Button>) {
  const accounts = useAccounts()
  const { mutateAsync: disconnect } = useDisconnectWallet()
  const { mutateAsync: switchAccount } = useSwitchAccount()
  const { networkConfig } = useNetwork()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="active"
          rounded="full"
          {...props}
          className={cn("px-4!", className)}
        >
          {currentAccount.label ||
            `${currentAccount.address.slice(0, 4)}...${currentAccount.address.slice(-4)}`}
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]">
        <div className="flex items-center gap-2 p-2">
          <div className="bg-primary size-10 rounded-full" />
          <div className="text-sm">
            <div className="font-semibold">{currentAccount.label}</div>
            <div className="text-muted-foreground">
              {formatAddress(currentAccount.address)}
            </div>
          </div>
          <Button
            variant="ghostSubtle"
            size="icon"
            className="ml-auto"
            onClick={async () => {
              await navigator.clipboard.writeText(currentAccount.address)
              toast.success("Copied to clipboard")
            }}
          >
            <Copy />
          </Button>
          <Link
            href={`${networkConfig.explorerUrl}/address/${currentAccount.address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghostSubtle" size="icon">
              <ExternalLink />
            </Button>
          </Link>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Wallets</DropdownMenuLabel>
          {accounts.map((account) => (
            <DropdownMenuItem
              key={account.address}
              onClick={() =>
                switchAccount({
                  account,
                })
              }
            >
              {formatAddress(account.address)}
              <span className="text-quaternary ml-auto">{account.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Link href="/portfolio">
          <DropdownMenuItem>
            <PieChart />
            Portfolio
          </DropdownMenuItem>
        </Link>
        {"faucet" in networkConfig && (
          <>
            <DropdownMenuSeparator />
            <NativeFaucetButton
              address={currentAccount.address}
              faucet={networkConfig.faucet as string}
            />
          </>
        )}
        {"faucetToken" in networkConfig && (
          <>
            <DropdownMenuSeparator />
            <TokenFaucetButton
              address={currentAccount.address}
              faucet={networkConfig.faucetToken as any}
            />
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => disconnect()}>
          <LogOut />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NativeFaucetButton({
  address,
  faucet,
}: {
  address: string
  faucet: string
}) {
  const { mutateAsync: requestFaucet, isPending: isRequestingFaucet } =
    useMutation({
      mutationFn: async () => {
        await requestSuiFromFaucetV0({
          host: faucet,
          recipient: address,
        })
      },
      onSuccess: () => {
        toast.success("Faucet request successful")
      },
      onError: () => {
        toast.error("Faucet request failed")
      },
    })
  return (
    <DropdownMenuItem
      disabled={isRequestingFaucet}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        requestFaucet()
      }}
    >
      <Droplets />
      Request Faucet
      {isRequestingFaucet && <Loader2 className="ml-auto animate-spin" />}
    </DropdownMenuItem>
  )
}

function TokenFaucetButton({
  address,
  faucet,
}: {
  address: string
  faucet: {
    ticker: string
    module: string
    cap: string
    exponent: number
  }
}) {
  const signAndExecute = useSignAndExecute()
  const queryClient = useQueryClient()
  const { mutateAsync: requestFaucet, isPending: isRequestingFaucet } =
    useMutation({
      mutationFn: async () => {
        const txb = new Transaction()
        txb.moveCall({
          target: `${faucet.module}::mint`,
          arguments: [
            txb.object(faucet.cap),
            txb.pure.u64(1000 * 10 ** faucet.exponent),
            txb.pure.id(address),
          ],
        })

        const tx = await signAndExecute.mutateAsync({
          transaction: txb,
        })
        triggerUpdateTokenBalance(queryClient, faucet.ticker, address)
        toast.success("Faucet request successful")
      },
    })

  return (
    <DropdownMenuItem
      disabled={isRequestingFaucet}
      onClick={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        requestFaucet()
      }}
    >
      <Droplets />
      Request {faucet.ticker} Faucet
      {isRequestingFaucet && <Loader2 className="ml-auto animate-spin" />}
    </DropdownMenuItem>
  )
}

function WalletButtonContent({
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)

  return (
    <ConnectModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="active"
          rounded="full"
          disabled={open}
          {...props}
          className={cn(className)}
        >
          {open ? (
            <>
              Connecting <Loader2 className="animate-spin" />
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      }
    />
  )
}
