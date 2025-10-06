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
import { useDraft } from "@/contexts/draft"
import { NavigationLink } from "@/components/ui/navigation-link"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

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
  const t = useTranslations()
  const { user } = useAppContext()
  const { hasDraft, clearDraft } = useDraft()

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavigationLink
                href="/dashboard"
                hasDraft={hasDraft}
                onLeave={clearDraft}
                className="flex items-center gap-2"
              >
                <img
                  src="/logo.png"
                  alt="ValidFlow Logo"
                  className="w-8"
                />
                <span className="text-xl font-bold text-primary">ValidFlow</span>
              </NavigationLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* 首页导航 */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="bg-gray-100 text-gray-900 h-12" asChild>
              <NavigationLink
                href="/dashboard"
                hasDraft={hasDraft}
                onLeave={clearDraft}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>{t('navigation.home')}</span>
              </NavigationLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* 分割线 */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* 最近使用 */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-gray-600">
            {t('recentItems.title')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              {data.recentItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton className="text-gray-900" asChild>
                    <NavigationLink
                      href="#"
                      hasDraft={hasDraft}
                      onLeave={clearDraft}
                      className="flex items-center gap-3 px-3 py-6"
                    >
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
                    </NavigationLink>
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
              <Link href="/settings" className="flex items-center gap-2">
                <span>{t('navigation.settings')}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
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
              <span className="text-sm text-gray-600">2300 {t('user.points')}</span>
              <Switch />
            </div>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}