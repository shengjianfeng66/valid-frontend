# @supabase/ssr 深度解析

## 一、什么是 @supabase/ssr

`@supabase/ssr` 是 Supabase 官方提供的**服务端渲染 (SSR) 辅助库**，专门用于在 Next.js、SvelteKit 等 SSR 框架中处理用户认证和 Session 管理。

### 核心功能
✅ **自动 Session 管理** - 无需手动实现 SessionManager  
✅ **Cookie 自动处理** - 安全地读写认证 Cookie  
✅ **服务端/客户端统一** - 提供一致的 API  
✅ **Session 自动刷新** - Token 过期自动续期  
✅ **安全性保障** - HTTP-Only Cookie、PKCE 流程

## 二、为什么不需要自己实现 SessionManager

### 传统方式 (如 NextAuth)
```typescript
// ❌ 需要自己管理
1. 实现 JWT 编码/解码
2. 手动设置 Cookie
3. 处理 Token 刷新逻辑
4. 管理 Session 过期
5. 客户端/服务端同步
```

### 使用 @supabase/ssr
```typescript
// ✅ 自动处理所有这些
import { createServerClient } from '@supabase/ssr'

// 一行代码搞定 Session 管理
const supabase = createServerClient(url, key, {
  cookies: {
    get: (name) => cookies().get(name)?.value,
    set: (name, value, options) => cookies().set(name, value, options),
    remove: (name, options) => cookies().set(name, '', options),
  }
})

// Session 自动从 Cookie 读取、验证、刷新
const { data: { user } } = await supabase.auth.getUser()
```

## 三、@supabase/ssr 工作原理

### 架构图
```
┌─────────────────────────────────────────────────┐
│                  Next.js App                     │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────┐        ┌──────────────┐       │
│  │ Server Side  │        │ Client Side  │       │
│  │              │        │              │       │
│  │ createServer │        │ createBrowser│       │
│  │   Client     │        │   Client     │       │
│  └──────┬───────┘        └──────┬───────┘       │
│         │                       │               │
│         └───────────┬───────────┘               │
│                     ▼                           │
│         ┌───────────────────────┐               │
│         │   @supabase/ssr       │               │
│         │  (Cookie Adapter)     │               │
│         └───────────┬───────────┘               │
│                     ▼                           │
├─────────────────────────────────────────────────┤
│              HTTP Cookies                        │
│  ┌─────────────────────────────────────┐        │
│  │ sb-access-token (HTTP-Only)         │        │
│  │ sb-refresh-token (HTTP-Only)        │        │
│  └─────────────────────────────────────┘        │
├─────────────────────────────────────────────────┤
                      ▼
              Supabase Auth API
```

### Session 生命周期

**1. 用户登录**
```typescript
// 客户端
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

**2. Supabase 返回 Tokens**
```json
{
  "access_token": "eyJhbG...",
  "refresh_token": "v1...",
  "expires_in": 3600
}
```

**3. @supabase/ssr 自动存储到 Cookie**
```
Set-Cookie: sb-access-token=eyJhbG...; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: sb-refresh-token=v1...; Path=/; HttpOnly; Secure; SameSite=Lax
```

**4. 后续请求自动携带 Cookie**
```typescript
// 服务端 - 自动从 Cookie 读取并验证
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
// ✅ user 信息自动解析，无需手动处理
```

**5. Token 过期自动刷新**
```typescript
// @supabase/ssr 内部逻辑
if (isTokenExpired(accessToken)) {
  const newTokens = await refreshSession(refreshToken)
  updateCookies(newTokens)  // 自动更新 Cookie
}
```

## 四、Next.js 中的实际使用

### 安装
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 1. 创建 Supabase 客户端工具函数

#### 服务端客户端 (Server Components, API Routes)
```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component 中可能无法设置 Cookie
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // 处理错误
          }
        },
      },
    }
  )
}
```

#### 客户端客户端 (Client Components)
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### 中间件客户端 (Middleware)
```typescript
// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 自动刷新 Session
  const { data: { user } } = await supabase.auth.getUser()

  // 保护路由
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2. Server Component 中使用
```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // ✅ Session 自动管理，无需手动处理
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 获取用户数据
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('uuid', user.id)
    .single()

  return (
    <div>
      <h1>Welcome {profile?.nickname}</h1>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

### 3. API Route 中使用
```typescript
// app/api/user/route.ts
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  
  // ✅ 自动从 Cookie 获取 Session
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 查询用户数据
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('uuid', user.id)
    .single()

  return Response.json({ user: userData })
}
```

### 4. Client Component 中使用
```typescript
// app/components/UserProfile.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    // ✅ 客户端也能自动读取 Session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // 监听 Session 变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (!user) return <div>Please login</div>

  return (
    <div>
      <p>{user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  )
}
```

### 5. 登录/注册实现
```typescript
// app/login/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    // ✅ OAuth 登录，自动处理 Cookie
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
    
    if (error) console.error('Login error:', error)
  }

  const handleEmailLogin = async (email: string, password: string) => {
    // ✅ 邮箱密码登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Login error:', error)
    } else {
      // Session 自动存储到 Cookie
      window.location.href = '/dashboard'
    }
  }

  return (
    <div>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  )
}
```

### 6. OAuth 回调处理
```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient()
    
    // ✅ 交换 code 获取 Session，自动存储到 Cookie
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 重定向到首页
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

## 五、@supabase/ssr vs NextAuth 对比

| 特性 | NextAuth.js | @supabase/ssr |
|------|-------------|---------------|
| **Session 管理** | 需要配置 JWT/Database adapter | ✅ 全自动 |
| **Cookie 处理** | 需要手动配置 | ✅ 内置处理 |
| **Token 刷新** | 需要自己实现 | ✅ 自动刷新 |
| **OAuth 配置** | 在代码中配置 | ✅ 在 Supabase Dashboard 配置 |
| **数据库集成** | 需要 Adapter | ✅ 原生集成 |
| **实时功能** | 不支持 | ✅ 支持 Realtime |
| **Row Level Security** | 不支持 | ✅ 原生支持 |
| **Edge Runtime** | 部分支持 | ✅ 完全支持 |
| **学习曲线** | 中等 | ✅ 低 |

## 六、迁移你的项目到 @supabase/ssr

### 步骤 1: 安装依赖
```bash
pnpm add @supabase/supabase-js @supabase/ssr
# 可选：暂时保留 next-auth 用于过渡
```

### 步骤 2: 创建工具函数
```bash
# 创建文件
mkdir -p src/lib/supabase
touch src/lib/supabase/server.ts
touch src/lib/supabase/client.ts
```

按照上面的示例代码创建这些文件

### 步骤 3: 替换认证逻辑

**当前 (NextAuth):**
```typescript
import { auth } from "@/auth"

// Server Component
const session = await auth()
const userUuid = session?.user?.uuid
```

**迁移后 (@supabase/ssr):**
```typescript
import { createClient } from "@/lib/supabase/server"

// Server Component
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
const userUuid = user?.id  // Supabase 的 user.id 就是 UUID
```

### 步骤 4: 更新 getUserUuid 服务
```typescript
// src/services/user.ts (新版本)
import { createClient } from "@/lib/supabase/server"

export async function getUserUuid() {
  // API Key 方式保持不变
  const token = await getBearerToken()
  if (token?.startsWith("sk-")) {
    return await getUserUuidByApiKey(token)
  }
  
  // ✅ 使用 Supabase Session
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return user?.id || ""
}

export async function getUserEmail() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return user?.email || ""
}
```

### 步骤 5: 更新登录组件
```typescript
// src/components/sign/modal.tsx
'use client'

import { createClient } from "@/lib/supabase/client"

export default function SignModal() {
  const supabase = createClient()
  
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }
  
  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }
  
  return (
    <div>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleGitHubLogin}>Login with GitHub</button>
    </div>
  )
}
```

### 步骤 6: 设置 Supabase Auth Trigger (替代 handleSignInUser)
```sql
-- 在 Supabase SQL Editor 执行

-- 1. 创建新用户处理函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 插入到 users 表
  INSERT INTO public.users (
    uuid,
    email,
    nickname,
    avatar_url,
    signin_type,
    signin_provider,
    signin_openid,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    'oauth',
    COALESCE(NEW.raw_app_meta_data->>'provider', NEW.raw_user_meta_data->>'provider', ''),
    NEW.id,
    NOW()
  )
  ON CONFLICT (uuid) DO NOTHING;
  
  -- 赠送新用户积分
  INSERT INTO public.credits (
    trans_no,
    created_at,
    user_uuid,
    trans_type,
    credits,
    expired_at
  ) VALUES (
    gen_random_uuid()::text,
    NOW(),
    NEW.id,
    'NewUser',
    1000,  -- 新用户赠送积分数量
    NOW() + INTERVAL '1 year'
  )
  ON CONFLICT (trans_no) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 步骤 7: 更新中间件
```typescript
// src/middleware.ts (新版本)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // ✅ 自动刷新过期的 Session
  await supabase.auth.getUser()

  return response
}
```

## 七、常见问题

### Q1: Session 存储在哪里？
**A:** 存储在 HTTP-Only Cookie 中，包含：
- `sb-access-token`: JWT Access Token
- `sb-refresh-token`: Refresh Token
- 浏览器自动携带，XSS 攻击无法读取

### Q2: Token 何时刷新？
**A:** @supabase/ssr 自动检测：
- Access Token 过期前自动使用 Refresh Token 续期
- 无需手动处理

### Q3: 如何处理多个 Supabase 项目？
**A:** 创建不同的客户端实例：
```typescript
const supabaseProject1 = createServerClient(URL1, KEY1, {...})
const supabaseProject2 = createServerClient(URL2, KEY2, {...})
```

### Q4: 如何在 Server Action 中使用？
**A:** 直接导入使用：
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  // 更新逻辑...
}
```

### Q5: 支持 Edge Runtime 吗？
**A:** ✅ 完全支持：
```typescript
export const runtime = 'edge'

export async function GET() {
  const supabase = createClient()
  // ... 正常使用
}
```

## 八、总结

### ✅ @supabase/ssr 的优势

1. **零配置 Session 管理**
   - 不需要实现 SessionManager
   - 不需要手动处理 Cookie
   - 不需要实现 Token 刷新逻辑

2. **安全性内置**
   - HTTP-Only Cookie
   - 自动 PKCE 流程
   - 防止 XSS/CSRF 攻击

3. **开发体验优秀**
   - 统一的 API (服务端/客户端)
   - TypeScript 完美支持
   - 实时 Session 同步

4. **与 Supabase 生态深度集成**
   - 原生 RLS 支持
   - Realtime 开箱即用
   - Edge Functions 兼容

### 🎯 最终建议

**对于你的项目：**
1. ✅ 使用 `@supabase/ssr` 替代 NextAuth
2. ✅ 无需自己实现 SessionManager
3. ✅ Session 管理完全自动化
4. ✅ 代码量减少 70%+

**迁移收益：**
- 🚀 开发速度提升
- 🔒 安全性增强
- 🛠️ 维护成本降低
- 📦 代码更简洁

---

**相关资源：**
- [Supabase SSR 官方文档](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router 示例](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
- [Auth Helpers Migration Guide](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)

