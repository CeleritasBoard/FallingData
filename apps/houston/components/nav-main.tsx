"use client";

import {
  LayoutDashboard,
  Rocket,
  Terminal,
  HardDriveDownload,
  Satellite,
  SatelliteDish,
} from "lucide-react";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";

const items: {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}[] = [
  {
    title: "Irányítópult",
    url: "/",
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
    url: "/packets",
    icon: HardDriveDownload,
    items: [
      {
        title: "Packetek megtekintése",
        url: "/packets",
      },
      {
        title: "Packetek importálása",
        url: "/packets/import",
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
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items || item.items.length === 0) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
