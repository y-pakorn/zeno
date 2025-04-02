"use client"

import Link from "next/link"
import { FaXTwitter } from "react-icons/fa6"

import { siteConfig } from "@/config/site"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Icons } from "@/components/icons"

export default function PreMarketLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <EmptyState
        icon={Icons.logo}
        header="Mobile Not Supported"
        description={
          <>
            Please use a desktop browser to access this page.
            <br />
            Mobile support is coming soon.
          </>
        }
      >
        <Link
          className="mt-2"
          href={`https://x.com/${siteConfig.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>
            Follow us on <FaXTwitter />
          </Button>
        </Link>
      </EmptyState>
    )
  }

  return children
}
