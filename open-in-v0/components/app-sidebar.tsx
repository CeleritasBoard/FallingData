"use client"

import type * as React from "react"
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Rocket,
  Terminal,
  HardDriveDownload,
  Satellite,
  SatelliteDish,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Celeritas-board",
      logo: GalleryVerticalEnd,
      plan: "Houston",
    },
  ],
  navMain: [
    {
      title: "Irányítópult",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Küldetések",
      url: "#",
      icon: Rocket,
      items: [
        {
          title: "Új küldetés létrehozása",
          url: "# ",
        },
      ],
    },
    {
      title: "Parancsok",
      url: "#",
      icon: Terminal,
      items: [
        {
          title: "Új parancs felküldése",
          url: "#",
        },
      ],
    },
    {
      title: "Packetek",
      url: "#",
      icon: HardDriveDownload,
      items: [
        {
          title: "Packetek importálása",
          url: "#",
        },
      ],
    },
    {
      title: "Eszközök",
      url: "# ",
      icon: Satellite,
      items: [
        {
          title: "BME Hunity",
          url: "# ",
        },
        {
          title: "Onionsat Teszt",
          url: "# ",
        },
        {
          title: "Sloth",
          url: "# ",
        },
      ],
    },
    {
      title: "Komm. ablakok",
      url: "# ",
      icon: SatelliteDish,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
