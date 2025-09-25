import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { NavActions } from "@/components/sidebar/nav-actions"
import { InterviewCardList } from "@/components/blocks/interview-card-list"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-4">
          {/* 用户访谈Card List */}
          <div className="w-full">
            <InterviewCardList />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
