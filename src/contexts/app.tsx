"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { cacheGet, cacheRemove } from "@/lib/cache";

import { CacheKey } from "@/services/constant";
import { ContextValue } from "@/types/context";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types/user";
import moment from "moment";
import { createClient } from "@/lib/supabase/client";
import { isAuthEnabled } from "@/lib/auth";
import SignModal from "@/components/sign/modal";

const AppContext = createContext({} as ContextValue);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  // Google One Tap 已禁用（NextAuth 已移除）
  // 如需重新启用，需基于 Supabase Auth 重新实现

  const supabase = createClient();
  const [showSignModal, setShowSignModal] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // 将 Supabase User 转换为应用 User 类型
  const convertSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => {
    const metadata = supabaseUser.user_metadata || {};
    const email = supabaseUser.email || '';

    // 检查是否为管理员（基于环境变量邮箱白名单）
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(email);

    return {
      uuid: supabaseUser.id,
      email: email,
      nickname: metadata.name || metadata.full_name || email.split('@')[0] || 'User',
      avatar_url: metadata.avatar_url || metadata.picture || '',
      created_at: supabaseUser.created_at,
      // 默认值，如需积分等信息可后续扩展
      credits: {
        left_credits: 0,
      },
      is_admin: isAdmin,
    };
  };

  // 监听 Supabase Auth 状态变化
  useEffect(() => {
    if (!isAuthEnabled()) return;

    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        const appUser = convertSupabaseUserToAppUser(supabaseUser);
        setUser(appUser);
      }
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const appUser = convertSupabaseUserToAppUser(session.user);
        setUser(appUser);
      } else {
        setUser(null);
        // 用户退出时，重置登录模态框状态，确保能重新触发自动显示
        setShowSignModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 全局自动登录检测逻辑
  useEffect(() => {
    if (!isAuthEnabled()) return;

    // 添加延迟，避免在认证状态加载时显示登录窗，防止闪烁
    const timer = setTimeout(() => {
      // 只有在用户未登录且登录窗未显示时才自动显示登录窗
      if (user === null && !showSignModal) {
        setShowSignModal(true);
      }
    }, 1000); // 1秒延迟，给认证系统足够时间加载

    return () => clearTimeout(timer);
  }, [user, showSignModal]);

  return (
    <AppContext.Provider
      value={{
        showSignModal,
        setShowSignModal,
        user,
        setUser,
        showFeedback,
        setShowFeedback,
      }}
    >
      {children}
      
      {/* 全局登录模态框 */}
      <SignModal />
    </AppContext.Provider>
  );
};
