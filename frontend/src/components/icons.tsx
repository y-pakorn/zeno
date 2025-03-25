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
  sui: ({ className, ...props }: ComponentProps<"img">) => (
    <img
      src="https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png"
      className={cn("size-4 object-contain object-center", className)}
      {...props}
    />
  ),
  walletMissing: ({ className, ...props }: ComponentProps<"svg">) => (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4", className)}
      {...props}
    >
      <path
        d="M38.6667 19.3328V10.876C38.6667 8.86601 38.6667 7.86099 38.2432 7.24336C37.8733 6.70373 37.3004 6.33716 36.6554 6.22741C35.9172 6.10178 35.0047 6.52295 33.1796 7.36527L11.7426 17.2593C10.115 18.0105 9.30115 18.3861 8.70509 18.9686C8.17814 19.4836 7.77591 20.1123 7.52914 20.8066C7.25 21.5919 7.25 22.4882 7.25 24.2808V36.2495M50.75 28.5C50.75 25.7931 50.75 27.0661 50.75 27.0661C50.75 24.3592 50.75 23.0058 50.2232 21.9718C49.7598 21.0624 49.0204 20.323 48.111 19.8596C47.0771 19.3328 45.7236 19.3328 43.0167 19.3328L14.9833 19.3328C12.2764 19.3328 10.923 19.3328 9.88905 19.8596C8.9796 20.323 8.24019 21.0624 7.7768 21.9718C7.25 23.0057 7.25 24.3592 7.25 27.0661L7.25 43.0161C7.25 45.723 7.25 47.0765 7.7768 48.1104C8.24019 49.0199 8.9796 49.7593 9.88905 50.2227C10.923 50.7495 12.2764 50.7495 14.9833 50.7495H32M37.7177 36.2554C38.1435 35.045 38.984 34.0243 40.0902 33.3741C41.1965 32.724 42.4972 32.4863 43.7618 32.7032C45.0265 32.9201 46.1736 33.5777 47 34.5593C47.8264 35.541 48.2786 36.7834 48.2767 38.0666C48.2767 41.6889 42.8433 43.5 42.8433 43.5M42.9136 50.75H42.9378"
        stroke="currentColor"
        strokeWidth="4.83333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

export const Icons: IconsType = icons
