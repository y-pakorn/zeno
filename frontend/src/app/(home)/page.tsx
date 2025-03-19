import { Hero } from "./hero"
import { NewListings } from "./new-listings"
import { RecentTransaction } from "./recent-transaction"

export default function Home() {
  return (
    <div className="space-y-8 py-2">
      <Hero />
      <NewListings />
      <RecentTransaction />
    </div>
  )
}
