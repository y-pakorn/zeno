import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Icons } from "@/components/icons"

export default function NotFound() {
  return (
    <EmptyState
      icon={Icons.logo}
      header="Page Not Found"
      description="The page you are looking for does not exist."
    >
      <Link href="/" className="mt-2">
        <Button>
          <ArrowLeft /> Back To Home
        </Button>
      </Link>
    </EmptyState>
  )
}
