"use client"

import type * as React from "react"
import {
  LayoutDashboard,
  Rocket,
  Terminal,
  HardDriveDownload,
  Satellite,
  SatelliteDish,
} from "lucide-react"

import Logo from "../../packages/houston/public/logo.svg"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@workspace/ui/components/sidebar"


// This is sample data.
const data = {
  teams: [
    {
      name: "Celeritas-board",
      logo: Logo,
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
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
