import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <Icons.logoText className="h-6" />
      <h1 className="font-heading text-3xl font-bold">Not Found</h1>
      <p className="text-muted-foreground text-sm">
        The page you are looking for does not exist.
      </p>
      <Link href="/">
        <Button>
          <ArrowLeft /> Back To Home
        </Button>
      </Link>
    </div>
  )
}
