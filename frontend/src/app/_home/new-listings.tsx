import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const data = [
  {
    id: "1",
    name: "PAWS",
    icon: "https://s3-alpha-sig.figma.com/img/9492/c6b3/cc523ae0278c7f371a97168679516a35?Expires=1743379200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=U6Ig4RP~-B9oM9vDZBORZ3XssOnkys-RM9TA4f9R6C0obcnRSQp7aKlYxmGVfwHkVRlEO~mJU8ZEwjE37eruibGHJ9q~Hsyh9319CoOFR2MIklLk3nld9H0DQxmeJVWh26~x81wSylglhN~c7v-67p7OkLK1KV0cjPXpaiDR5SJTIzapMWqIcbqtzn8maKZwsSn4WQdiMWTj2h48U6R8S87BDrESsNTECtjUHGUOj~qUNmxVAZzNfJ-X0VH1XSbccKAOCJFlCD5JKiykRQRF7f4ySfA~qEYaWNAI7OC3h1J4uOPYBA3wjeVEiRGQ2du5LT3z2GI6X5E9hTvx2Niv0g__",
    price: 0.00051,
    change24h: 0.82,
    vol24h: 2798.5,
    volTotal: 43589.24,
  },
  {
    id: "2",
    name: "INIT",
    icon: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/INIT.svg",
    price: 1.32,
    change24h: -6.3,
    vol24h: 8560,
    volTotal: 134050,
  },
  {
    id: "3",
    name: "KAMI",
    icon: "https://registry.testnet.initia.xyz/yominet/images/kamigochi.png",
    price: 0.85,
    change24h: 3.2,
    vol24h: 5430,
    volTotal: 98750,
  },
] as NewListingCardProps[]

interface NewListingCardProps {
  id: string
  name: string
  icon: string
  price: number
  change24h: number
  vol24h: number
  volTotal: number
}

export function NewListings() {
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">New Listings</h2>
      <div className="flex w-full gap-4 overflow-x-auto">
        {data.map((item) => (
          <NewListingCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  )
}

export function NewListingCard(item: NewListingCardProps) {
  return (
    <div className="w-[260px]">
      <div className="relative aspect-[1.25] flex-1 overflow-hidden rounded-t-2xl">
        <div
          className="size-full scale-200 bg-cover bg-center opacity-30 blur-lg"
          style={{
            backgroundImage: `url(${item.icon})`,
          }}
        />
        <img
          src={item.icon}
          alt={item.name}
          className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover object-center"
        />
      </div>
      <div className="bg-secondary rounded-b-2xl px-4 py-3">
        <div className="*:*:odd:text-secondary-foreground space-y-1 text-xs font-medium *:inline-flex *:w-full *:*:even:ml-auto">
          <div>
            <h3 className="text-primary! text-lg font-bold">{item.name}</h3>
            <span className="text-muted-foreground text-sm">Price</span>
          </div>
          <div className="text-sm font-semibold">
            <span
              className={cn(
                item.change24h >= 0 ? "text-success!" : "text-error!"
              )}
            >
              {item.change24h >= 0 ? "+" : ""}
              {item.change24h}%
            </span>
            <span>${item.price.toLocaleString()}</span>
          </div>
          <Separator className="mt-2" />
          <div>
            <span>24h Volume</span>
            <span>${item.vol24h.toLocaleString()}</span>
          </div>
          <div>
            <span>Total Volume</span>
            <span>${item.volTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
