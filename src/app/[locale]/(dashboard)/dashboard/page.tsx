import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { NavActions } from "@/components/sidebar/nav-actions"
import { AiChatBlock } from "@/components/blocks/ai-chat-block"
import { ShowcaseBlock } from "@/components/blocks/showcase-block"
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
import LocaleToggle from "@/components/locale/toggle"
import SignToggle from "@/components/sign/toggle"

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
          <div className="flex items-center gap-2 px-3">
            <LocaleToggle />
            <SignToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-8 p-4">
          {/* AI对话框区域 */}
          <div className="w-full">
            <AiChatBlock />
          </div>

          {/* Showcase列表区域 */}
          <div className="w-full">
            <ShowcaseBlock />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
