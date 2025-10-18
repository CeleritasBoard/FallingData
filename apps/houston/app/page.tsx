import { AppSidebar } from "../components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/src/components/sidebar.tsx";

export default async function Home() {
  return (
    <div>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset />
        <p className="self-center text-center w-full">
          A packetes táblázat a Packetek {">"} Packetek megtekintése menüpont
          alól elérhető
        </p>
      </SidebarProvider>
    </div>
  );
}
