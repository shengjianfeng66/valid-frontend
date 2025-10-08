"use client"

import * as React from "react"
import useSWR from "swr"
import { useRouter } from 'next/navigation'

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

// 项目类型定义
interface Interview {
  id: number;
  name: string;
  description: string | null;
  proposal: any;
  outline: any;
  questionnaire: any;
  duration: number | null;
  organization_id: number | null;
  user_id: number;
  project_id: number | null;
  state: number;
  created_at: string;
}

// fetcher 函数 - 直接返回数组
const fetcher = async (url: string): Promise<Interview[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations()
  const { user } = useAppContext()
  const { hasDraft, clearDraft } = useDraft()
  const router = useRouter()

  // 使用 SWR 获取项目列表
  const { data: interviews, error, isLoading } = useSWR(
    'http://localhost:8000/api/v1/interview/list',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // 处理错误
  React.useEffect(() => {
    if (error) {
      console.error('获取项目列表失败:', error);
    }
  }, [error]);

  // 处理访谈项点击
  const handleInterviewClick = (id: number) => {
    if (hasDraft) {
      const confirmed = window.confirm('您有未保存的更改，是否继续？');
      if (confirmed) {
        clearDraft();
        router.push(`/insight/interview?id=${id}`);
      }
    } else {
      router.push(`/insight/interview?id=${id}`);
    }
  };

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

        {/* 项目列表 */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-gray-600">
            {t('recentItems.title')}
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              {isLoading ? (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  加载中...
                </div>
              ) : interviews && interviews.length > 0 ? (
                interviews.map((interview) => {
                  const date = new Date(interview.created_at).toLocaleDateString('zh-CN', {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit'
                  }).replace(/\//g, '/');

                  return (
                    <SidebarMenuItem key={interview.id}>
                      <SidebarMenuButton className="text-gray-900" asChild>
                        <NavigationLink
                          href={`/insight/interview?id=${interview.id}`}
                          hasDraft={hasDraft}
                          onLeave={clearDraft}
                          className="flex items-center gap-3 px-3 py-6"
                        >
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate leading-5">
                              {interview.name}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-1 leading-4">
                              <span>访谈 #{interview.id}</span>
                              <span>{date}</span>
                            </div>
                          </div>
                        </NavigationLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              ) : (
                <div className="px-3 py-6 text-center text-sm text-gray-500">
                  暂无项目
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* 设置 */}
        {/* <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <span>{t('navigation.settings')}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}

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