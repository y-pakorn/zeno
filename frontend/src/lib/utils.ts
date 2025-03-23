import BigNumber from "bignumber.js"
import { clsx, type ClassValue } from "clsx"
import numbro from "numbro"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-6)}`
}

export const formatBigNumber = (value: BigNumber, decimals = 2) => {
  return numbro(value).format({
    mantissa: decimals,
    thousandSeparated: true,
    optionalMantissa: true,
  })
}
