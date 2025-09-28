import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { SidebarMenu, SidebarMenuItem } from "@workspace/ui/components/sidebar"
import {createClient} from "@/lib/supabase/client";
import {CurrentUserAvatar} from "@/components/current-user-avatar";
import {UserResponse} from "@supabase/supabase-js";



export async function NavUser(){
    const client = await createClient().auth;
    const user: UserResponse = client.getUser();
    const  email: string = "??"//user.data.user.email;
    const fullName: string = "??"//user.data.user.user_metadata.full_name;
    const avatar = "??"//user.data.user.user_metadata.avatar_url;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex items-center gap-2 flex-1">
              <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatar || "/placeholder.svg"}
                           alt={fullName} />
              <AvatarFallback className="rounded-lg">??</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{fullName}</span>
              <span className="truncate text-xs">{email}</span>

            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={await client.signOut()}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Kijelentkezés</span>
          </Button>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
