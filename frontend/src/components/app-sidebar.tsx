"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, KanbanSquare, Layout, PieChart } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Icons } from "./icons"
import { Button } from "./ui/button"

const items = [
  {
    label: "Home",
    items: [
      {
        label: "Home",
        icon: Home,
        href: "/",
      },
    ],
  },
  {
    label: "Market",
    items: [
      {
        label: "Pre-Market",
        icon: KanbanSquare,
        href: "/pre-market",
        className: "-rotate-90",
        matchFn: (pathname) => pathname.startsWith("/pre-market"),
      },
    ],
  },
  {
    label: "Dashboard",
    items: [
      {
        label: "Portfolio",
        icon: PieChart,
        href: "/portfolio",
      },
    ],
  },
] as {
  label: string
  items: {
    label: string
    icon: React.ElementType
    href: string
    className?: string
    matchFn?: (pathname: string) => boolean
  }[]
}[]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="items-start *:h-9">
        <Icons.logo className="group-data-[state=expanded]:hidden" />
        <Icons.logoText className="group-data-[state=collapsed]:hidden" />
      </SidebarHeader>
      <SidebarContent>
        {items.map((item) => (
          <SidebarGroup key={item.label}>
            <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <Link href={item.href} key={item.href}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={
                          item.matchFn
                            ? item.matchFn(pathname)
                            : item.href === pathname
                        }
                      >
                        <item.icon className={cn(item.className)} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="flex-row justify-end group-data-[state=collapsed]:justify-center">
        <Link
          href={`https://x.com/${siteConfig.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-auto group-data-[state=collapsed]:hidden"
        >
          <Button variant="ghost" size="icon">
            <FaXTwitter />
          </Button>
        </Link>
        <SidebarTrigger size="icon" rounded="full" variant="outline">
          <Layout />
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  )
}
