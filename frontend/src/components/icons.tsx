import { ComponentProps } from "react"
import { Command, Moon, SunMedium } from "lucide-react"

import { cn } from "@/lib/utils"

export type IconKeys = keyof typeof icons

type IconsType = {
  [key in IconKeys]: React.ElementType
}

const icons = {
  logo: ({ className, ...props }: ComponentProps<"img">) => (
    <img
      src="/assets/logo.svg"
      className={cn("object-contain object-center", className)}
      {...props}
    />
  ),
  logoText: ({ className, ...props }: ComponentProps<"img">) => (
    <img
      src="/assets/logo-text.svg"
      className={cn("object-contain object-center", className)}
      {...props}
    />
  ),
}

export const Icons: IconsType = icons
