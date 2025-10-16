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
    console.log("🚀 ~ convertSupabaseUserToAppUser ~ supabaseUser:", supabaseUser)
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
    console.log("🚀 ~ useEffect ~ isAuthEnabled:", isAuthEnabled())

    if (!isAuthEnabled()) return;

    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user: supabaseUser } }) => {
      if (supabaseUser) {
        const appUser = convertSupabaseUserToAppUser(supabaseUser);
        console.log("🚀 ~ supabase.auth.getUser ~ appUser:", appUser)
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
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    </AppContext.Provider>
  );
};
