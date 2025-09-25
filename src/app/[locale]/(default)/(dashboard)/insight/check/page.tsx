"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ProcessSteps from "@/components/blocks/process-steps";

export default function CheckPage() {
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
          {/* 流程状态栏 */}
          <ProcessSteps currentStep={3} />
          
          {/* 页面内容 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">确认计划</h1>
            <p className="text-gray-600">这里是确认计划页面的内容...</p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}