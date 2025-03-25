"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Book, Home, KanbanSquare, Layout, PieChart } from "lucide-react"
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
        href: "/home",
        disabled: true,
      },
    ],
  },
  {
    label: "Market",
    items: [
      {
        label: "Pre-Market",
        icon: KanbanSquare,
        href: "/",
        className: "-rotate-90",
        // matchFn: (pathname) => pathname.startsWith("/pre-market"),
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
    disabled?: boolean
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
                  <Link
                    href={item.href}
                    key={item.href}
                    className={cn(item.disabled && "pointer-events-none")}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        disabled={item.disabled}
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
          href={siteConfig.links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="group-data-[state=collapsed]:hidden"
        >
          <Button variant="ghost" size="icon">
            <FaXTwitter />
          </Button>
        </Link>
        <Link
          href={siteConfig.links.docs}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-auto group-data-[state=collapsed]:hidden"
        >
          <Button variant="ghost" size="icon">
            <Book />
          </Button>
        </Link>
        <SidebarTrigger size="icon" rounded="full" variant="outline">
          <Layout />
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  )
}
