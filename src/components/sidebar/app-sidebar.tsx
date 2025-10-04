"use client"

import * as React from "react"

import {
  Home,
  Settings,
  ChevronRight,
  FileText,
  User,
} from "lucide-react"
import { useAppContext } from "@/contexts/app"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

// This is sample data.
const data = {
  user: {
    name: "杨昊霖",
    email: "yanghaolin@example.com",
    avatar: "/avatars/user.jpg",
    points: 2300,
  },
  recentItems: [
    {
      name: "模拟验证驱动的AI产品规划...",
      size: "1.52 KB",
      date: "24/03/2025",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAppContext()

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="ValidFlow Logo"
                  className="w-8"
                />
                <span className="text-xl font-bold text-primary">ValidFlow</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 首页导航 */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="bg-gray-100 text-gray-900" asChild>
              <a href="/dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>首页</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 最近使用 */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-gray-600">
            最近使用
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              {data.recentItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton className="text-gray-900" asChild>
                    <a href="#" className="flex items-center gap-3 px-3 py-6">
                      <item.icon className="w-4 h-4 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate leading-5">
                          {item.name}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1 leading-4">
                          <span>{item.size}</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* 设置 */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/settings" className="flex items-center gap-2">
                <span>设置</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 用户信息 - 仅显示已登录用户 */}
        {user && (
          <div className="flex items-center gap-3 p-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.name || user.email}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">2300</span>
              <Switch />
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}