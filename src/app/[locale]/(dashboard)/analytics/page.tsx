"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        <div className="flex flex-1 flex-col bg-gray-100 min-h-0">
          {/* 可滚动区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {/* 数据表格 */}
            <div className="bg-white rounded-lg shadow-sm">
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
