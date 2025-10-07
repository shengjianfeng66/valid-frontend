# Supabase 客户端详解

## 📊 三种客户端对比

| 客户端 | 使用场景 | Cookie 处理 | 环境 |
|--------|----------|-------------|------|
| **Browser Client** | 客户端组件 | 自动 | 浏览器 |
| **Server Client** | 服务端组件、API Routes | 手动配置 | Node.js |
| **Middleware Client** | Next.js 中间件 | 特殊处理 | Edge Runtime |

---

## 1. Browser Client (client.ts)

### 用途
在**浏览器环境**中运行的组件使用（Client Components）

### 使用场景
```typescript
"use client";  // ⚠️ 必须有这个指令

import { createClient } from "@/lib/supabase/client";

export default function MyClientComponent() {
  const supabase = createClient();
  
  // 用于客户端操作
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google"
    });
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```

### 特点
- ✅ 自动管理 Cookie
- ✅ 支持实时订阅
- ✅ 浏览器 API 可用
- ✅ 简单直接，无需配置

### 实际使用
```typescript
// 登录按钮组件
// src/components/sign/oauth-buttons.tsx
const supabase = createClient();
await supabase.auth.signInWithOAuth({ ... });

// 用户信息监听
// src/contexts/app.tsx
supabase.auth.onAuthStateChange((event, session) => {
  setUser(session?.user);
});
```

---

## 2. Server Client (server.ts)

### 用途
在**服务器端**运行的组件和 API 使用（Server Components, API Routes）

### 使用场景
```typescript
// ✅ Server Component (默认)
import { createClient } from "@/lib/supabase/server";

export default async function ServerPage() {
  const supabase = await createClient();
  
  // 服务器端获取数据
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>Welcome {user?.email}</div>;
}
```

### 特点
- ✅ 支持 `async/await`
- ✅ 手动管理 Cookie（通过 Next.js cookies API）
- ✅ 更安全（不暴露给客户端）
- ✅ 可以访问服务器端 API

### Cookie 处理机制
```typescript
export async function createClient() {
  const cookieStore = await cookies();  // Next.js API
  
  return createServerClient(url, key, {
    cookies: {
      // 从 HTTP Cookie 读取
      get(name) {
        return cookieStore.get(name)?.value;
      },
      // 设置 Cookie
      set(name, value, options) {
        cookieStore.set({ name, value, ...options });
      },
      // 删除 Cookie
      remove(name, options) {
        cookieStore.set({ name, value: "", ...options });
      }
    }
  });
}
```

### 实际使用
```typescript
// 获取用户信息服务
// src/services/user.ts
export async function getUserUuid() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || "";
}

// 登录页面
// src/app/[locale]/auth/signin/page.tsx
export default async function SignInPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    redirect("/");
  }
  
  return <SignForm />;
}

// API Route
// src/app/api/user/route.ts
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return Response.json({ user });
}
```

---

## 3. Middleware Client (middleware.ts)

### 用途
在 **Next.js 中间件**中使用，处理每个请求

### 使用场景
```typescript
// src/middleware.ts
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 自动刷新 Session
  const { response, user } = await updateSession(request);
  
  // 保护路由
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

### 特点
- ✅ 在每个请求前运行
- ✅ 自动刷新即将过期的 Token
- ✅ 统一处理 Cookie
- ✅ 适合路由保护

### Cookie 处理机制
```typescript
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next();
  
  const supabase = createServerClient(url, key, {
    cookies: {
      // 从请求读取
      get(name) {
        return request.cookies.get(name)?.value;
      },
      // 同时更新请求和响应的 Cookie
      set(name, value, options) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      // 删除 Cookie
      remove(name, options) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      }
    }
  });
  
  // 触发 Token 刷新（如果需要）
  await supabase.auth.getUser();
  
  return { response, user };
}
```

---

## 🔄 完整认证流程示例

### 场景：用户登录并访问受保护页面

```typescript
// 1. 用户点击登录 (Browser Client)
// src/components/sign/oauth-buttons.tsx
"use client";
const supabase = createClient();  // Browser
await supabase.auth.signInWithOAuth({ provider: "google" });

// 2. OAuth 回调 (Server Client)
// src/app/api/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const supabase = await createClient();  // Server
  await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect("/");
}

// 3. 访问受保护页面 (Middleware)
// src/middleware.ts
const { response, user } = await updateSession(request);  // Middleware
if (!user) return redirect("/login");

// 4. 渲染页面 (Server Client)
// src/app/dashboard/page.tsx
const supabase = await createClient();  // Server
const { data: { user } } = await supabase.auth.getUser();
return <div>Welcome {user.email}</div>;

// 5. 客户端交互 (Browser Client)
// src/components/UserProfile.tsx
"use client";
const supabase = createClient();  // Browser
const handleLogout = () => supabase.auth.signOut();
```

---

## 📌 使用规则速查

### ✅ 使用 Browser Client 的情况

```typescript
"use client";  // ← 有这个指令

// ✅ 事件处理
onClick={() => supabase.auth.signInWithOAuth(...)}

// ✅ 实时监听
supabase.auth.onAuthStateChange(...)
supabase.channel('room').on('broadcast', ...)

// ✅ 客户端状态管理
useState, useEffect, hooks 中使用
```

### ✅ 使用 Server Client 的情况

```typescript
// ✅ Server Component (默认，无 "use client")
export default async function Page() {
  const supabase = await createClient();
  ...
}

// ✅ API Route
export async function GET() {
  const supabase = await createClient();
  ...
}

// ✅ Server Action
"use server";
export async function updateProfile() {
  const supabase = await createClient();
  ...
}

// ✅ 服务层函数
export async function getUserInfo() {
  const supabase = await createClient();
  ...
}
```

### ✅ 使用 Middleware Client 的情况

```typescript
// ✅ 只在 middleware.ts 中使用
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  ...
}
```

---

## ⚠️ 常见错误

### ❌ 错误 1: 在 Server Component 中使用 Browser Client

```typescript
// ❌ 错误
import { createClient } from "@/lib/supabase/client";

export default async function Page() {
  const supabase = createClient();  // 报错！
}
```

**原因**: Browser Client 依赖浏览器 API，在服务器端不可用。

**解决**: 使用 Server Client
```typescript
// ✅ 正确
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();  // ✓
}
```

### ❌ 错误 2: 在 Client Component 中使用 Server Client

```typescript
"use client";
import { createClient } from "@/lib/supabase/server";  // ❌

export default function Component() {
  const supabase = await createClient();  // 报错！
}
```

**原因**: Server Client 使用了服务器端 API (`cookies()`)，在客户端不可用。

**解决**: 使用 Browser Client
```typescript
"use client";
import { createClient } from "@/lib/supabase/client";  // ✅

export default function Component() {
  const supabase = createClient();  // ✓
}
```

---

## 🎯 选择决策树

```
需要 Supabase Client？
│
├─ 在 middleware.ts 中？
│  └─ ✅ 使用 updateSession (middleware.ts)
│
├─ 有 "use client" 指令？
│  └─ ✅ 使用 Browser Client (client.ts)
│
└─ 服务器端（Server Component/API/Service）？
   └─ ✅ 使用 Server Client (server.ts)
```

---

## 💡 最佳实践

1. **默认使用 Server Client**
   - 更安全（不暴露给浏览器）
   - 性能更好（服务器端渲染）

2. **仅在必要时使用 Browser Client**
   - 需要用户交互（点击、输入）
   - 需要实时订阅
   - 需要浏览器 API

3. **在 Middleware 中刷新 Session**
   - 确保 Token 始终有效
   - 统一处理认证状态

4. **不要在客户端暴露敏感操作**
   - 数据库写入 → Server Client
   - 管理员操作 → Server Client
   - 用户登录 → Browser Client (OAuth) + Server Client (验证)

---

**更新日期**: 2025-10-07

