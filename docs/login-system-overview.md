# ValidFlow 登录功能梳理

## 📋 认证系统概览

**认证方式**：Supabase Auth（已从 NextAuth 迁移）  
**支持的登录方式**：
1. ✅ Google OAuth
2. ✅ GitHub OAuth
3. ✅ Magic Link（邮箱无密码登录）

---

## 🏗️ 系统架构

### 1. 双用户系统

项目中有两个用户数据存储：

#### 1️⃣ **Supabase Auth 用户**（认证系统）
- **负责**：登录、注册、Session 管理
- **存储位置**：Supabase Auth 系统
- **用户 ID**：UUID 格式（例如：`eb2dad81-c977-4824-b511-0abeccf9cfdb`）
- **API**：`https://eixyepowkmnqofbgjaih.supabase.co/auth/v1/user`

#### 2️⃣ **业务数据库 `user` 表**（业务数据）
- **负责**：存储额外的业务信息
- **字段**：积分、昵称、头像、邀请码等
- **表名**：`user`
- **关联**：`user.uuid` = Supabase Auth 的 `user.id`

---

## 🔐 登录流程

### 方式 1️⃣：Google OAuth 登录

```
用户点击 "Google 登录"
    ↓
调用 supabase.auth.signInWithOAuth({ provider: "google" })
    ↓
跳转到 Google 授权页面
    ↓
授权成功后回调到 /api/auth/callback
    ↓
exchangeCodeForSession() 获取 session
    ↓
重定向到首页或回调地址
    ↓
Supabase 触发器自动创建 user 表记录
    ↓
用户登录完成 ✅
```

**相关文件**：
- 登录按钮：`src/components/sign/oauth-buttons.tsx` (第 12-18 行)
- 回调处理：`src/app/api/auth/callback/route.ts` (第 14 行)

### 方式 2️⃣：GitHub OAuth 登录

```
用户点击 "GitHub 登录"
    ↓
调用 supabase.auth.signInWithOAuth({ provider: "github" })
    ↓
跳转到 GitHub 授权页面
    ↓
授权成功后回调到 /api/auth/callback
    ↓
（后续流程同 Google）
```

**相关文件**：
- 登录按钮：`src/components/sign/oauth-buttons.tsx` (第 21-28 行)

### 方式 3️⃣：Magic Link 邮箱登录

```
用户输入邮箱
    ↓
点击 "发送 Magic Link"
    ↓
调用 supabase.auth.signInWithOtp({ email })
    ↓
Supabase 发送登录链接到邮箱
    ↓
用户点击邮箱中的链接
    ↓
回调到 /api/auth/callback
    ↓
登录成功 ✅
```

**相关文件**：
- 邮箱表单：`src/components/sign/magic-link-form.tsx` (第 38-43 行)

---

## 📂 核心文件结构

### 认证配置
```
src/auth/
├── config.ts          # NextAuth 配置（已废弃，保留兼容）
├── handler.ts         # 用户处理器（已废弃）
└── index.ts           # NextAuth 导出（已废弃）
```

### Supabase 客户端
```
src/lib/supabase/
├── client.ts          # 客户端（浏览器）
├── server.ts          # 服务端（SSR）
├── middleware.ts      # 中间件（Session 刷新）
└── index.ts           # 导出
```

### 登录组件
```
src/components/sign/
├── form.tsx           # 登录表单（页面版）
├── modal.tsx          # 登录模态框（弹窗版）
├── oauth-buttons.tsx  # OAuth 登录按钮
├── magic-link-form.tsx # Magic Link 表单
├── user.tsx           # 用户下拉菜单
└── toggle.tsx         # 登录/注销切换
```

### API 路由
```
src/app/api/
├── auth/
│   └── callback/route.ts  # OAuth 回调处理
└── get-user-info/route.ts # 获取用户信息
```

---

## 🔑 环境变量配置

### Supabase 配置（必需）
```bash
NEXT_PUBLIC_SUPABASE_URL=https://eixyepowkmnqofbgjaih.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5dudSj3CQDbIci5DmhoydA_1WqNKQMR
```

### OAuth 配置（可选）
```bash
# Google OAuth
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx

# GitHub OAuth
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true
AUTH_GITHUB_ID=xxx
AUTH_GITHUB_SECRET=xxx

# Google One Tap
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED=true
```

### 其他配置
```bash
NEXT_PUBLIC_AUTH_ENABLED=true  # 启用认证功能
```

---

## 🔄 登录后的数据同步

### 自动触发器（Supabase 端）

位置：`src/db/migrations/001_setup_auth_triggers.sql`

当 Supabase Auth 用户登录时，自动：
1. 在 `user` 表中创建对应记录
2. 同步用户信息（email, nickname, avatar_url）
3. 生成邀请码

### 前端获取用户信息

```typescript
// 方式 1：通过 Context（推荐）
const { user } = useAppContext();

// 方式 2：直接调用 API
const resp = await fetch("/api/get-user-info", { method: "POST" });
const { data } = await resp.json();
```

**流程**：
```
fetchUserInfo() 
    ↓
POST /api/get-user-info
    ↓
getUserUuid() - 从 Supabase Auth 获取 UUID
    ↓
findUserByUuid() - 从数据库查询用户
    ↓
getUserCredits() - 获取用户积分
    ↓
返回完整用户信息 { ...user, credits, is_admin }
```

---

## 🎨 UI 组件使用

### 1. 登录页面（独立页面）
```typescript
// src/app/[locale]/auth/signin/page.tsx
<SignForm />  // 完整的登录表单
```

访问地址：`/auth/signin`

### 2. 登录模态框（弹窗）
```typescript
// 在任何组件中
const { setShowSignModal } = useAppContext();

<Button onClick={() => setShowSignModal(true)}>
  登录
</Button>

// 在 layout 中已包含
<SignModal />  // 自动监听 showSignModal 状态
```

### 3. 用户菜单
```typescript
// 已登录用户显示头像和菜单
{user ? (
  <SignUser user={user} />
) : (
  <Button onClick={() => setShowSignModal(true)}>登录</Button>
)}
```

---

## 🛡️ Session 管理

### Middleware 自动刷新

位置：`src/middleware.ts` (第 9-10 行)

每次请求都会：
1. 调用 `updateSession()` 更新 Supabase Session
2. 自动刷新即将过期的 Token
3. 保持用户登录状态

### 客户端 Session 检查

```typescript
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // 已登录
} else {
  // 未登录
}
```

---

## 🔐 登出流程

```typescript
// src/components/sign/user.tsx (第 26-29 行)
const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.refresh();
};
```

**流程**：
1. 调用 `supabase.auth.signOut()`
2. 清除本地 Session
3. 刷新页面（`router.refresh()`）
4. 用户回到未登录状态

---

## 🎯 完整登录流程图

```
┌─────────────────┐
│   用户访问网站   │
└────────┬────────┘
         │
         ├──已登录？
         │    ├─ Yes ─→ 显示用户头像和菜单
         │    └─ No ──→ 显示"登录"按钮
         │
         ↓ 点击登录
         │
┌────────────────────┐
│   选择登录方式      │
├────────────────────┤
│ 1. Google OAuth    │
│ 2. GitHub OAuth    │
│ 3. Magic Link      │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│   Supabase Auth    │
│   处理认证请求      │
└────────┬───────────┘
         │
         ↓ 认证成功
         │
┌────────────────────┐
│ 回调到 /api/auth/  │
│      callback      │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│ exchangeCodeFor    │
│     Session        │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│ Supabase 触发器    │
│ 自动创建 user 记录 │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│  登录成功，重定向  │
│   到首页或回调地址  │
└────────────────────┘
```

---

## 🔧 关键代码片段

### 1. 创建 Supabase 客户端（浏览器端）
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 2. 创建 Supabase 客户端（服务端）
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* 配置 */ } }
  );
}
```

### 3. Google 登录
```typescript
// src/components/sign/oauth-buttons.tsx
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });
};
```

### 4. Magic Link 登录
```typescript
// src/components/sign/magic-link-form.tsx
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/api/auth/callback`,
  },
});
```

### 5. 获取当前用户
```typescript
// 服务端
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

// 客户端
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### 6. 登出
```typescript
await supabase.auth.signOut();
router.refresh();
```

---

## 🌐 用户体验流程

### 新用户注册流程

```
1. 用户选择登录方式（Google/GitHub/Email）
2. 完成 OAuth 授权或邮箱验证
3. Supabase Auth 创建认证用户
4. 🎯 触发器自动在 user 表创建记录
5. 🎁 自动赠送新用户积分
6. ✅ 登录成功，跳转到首页
```

### 老用户登录流程

```
1. 用户选择登录方式
2. 完成认证
3. Supabase Auth 验证身份
4. 触发器检查 user 表（已存在，不重复创建）
5. ✅ 登录成功，跳转到首页
```

---

## 🔍 中间件（Middleware）

位置：`src/middleware.ts`

**作用**：
1. 自动刷新即将过期的 Session Token
2. 保持用户登录状态
3. 处理国际化路由

**执行顺序**：
```
每个请求
    ↓
updateSession() - Supabase Session 刷新
    ↓
intlMiddleware() - 国际化处理
    ↓
合并 Cookie
    ↓
返回响应
```

**匹配规则**：
```typescript
matcher: [
  "/",
  "/(en|zh|...)/:path*",
  "/((?!api/|_next|_vercel|.*\\..*).*)",
]
```

---

## 📱 前端状态管理

### AppContext

位置：`src/contexts/app.tsx`

**提供的状态**：
```typescript
{
  user: User | null,           // 当前登录用户
  showSignModal: boolean,      // 登录弹窗状态
  showFeedback: boolean,       // 反馈弹窗状态
  setShowSignModal: (show) => void,
  setShowFeedback: (show) => void,
}
```

**使用方式**：
```typescript
const { user, setShowSignModal } = useAppContext();

// 显示登录弹窗
setShowSignModal(true);

// 检查是否登录
if (!user) {
  setShowSignModal(true);
}
```

---

## 🚀 登录页面路由

### 1. 独立登录页
- **路径**：`/auth/signin`
- **组件**：`src/app/[locale]/auth/signin/page.tsx`
- **特点**：
  - 全屏登录页面
  - 已登录用户自动重定向
  - 支持 `callbackUrl` 参数

**使用示例**：
```typescript
// 跳转到登录页，登录后返回当前页
router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`);
```

### 2. 登录模态框
- **组件**：`src/components/sign/modal.tsx`
- **特点**：
  - 弹窗形式
  - 响应式设计（桌面用 Dialog，移动用 Drawer）
  - 全局可用

**使用示例**：
```typescript
const { setShowSignModal } = useAppContext();

<Button onClick={() => setShowSignModal(true)}>
  登录
</Button>
```

---

## 🔐 权限控制

### 检查登录状态

#### 服务端（Server Component）
```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }
  
  // 继续渲染页面
}
```

#### 客户端（Client Component）
```typescript
import { useAppContext } from "@/contexts/app";

export default function Component() {
  const { user, setShowSignModal } = useAppContext();
  
  useEffect(() => {
    if (!user) {
      setShowSignModal(true);
    }
  }, [user]);
}
```

### 管理员权限

```typescript
// src/app/api/get-user-info/route.ts (第 22-27 行)
const admin_emails = process.env.ADMIN_EMAILS?.split(",");

const user = {
  ...(dbUser as unknown as User),
  credits: userCredits,
  is_admin: !!admin_emails?.includes(dbUser.email),  // ← 检查是否是管理员
};
```

**环境变量**：
```bash
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

---

## 🐛 常见问题

### 1. 登录后 get-user-info 返回错误

**问题**：`relation "user" does not exist`

**原因**：数据库表未创建

**解决**：运行数据库迁移 `pnpm drizzle-kit push`

### 2. Vercel 部署 500 错误

**问题**：`MIDDLEWARE_INVOCATION_FAILED`

**原因**：Vercel 环境变量未配置

**解决**：在 Vercel 添加 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. OAuth 回调失败

**问题**：授权后回调到错误地址

**原因**：OAuth 配置中的回调地址不正确

**解决**：
- Google：检查 Google Cloud Console 中的授权回调 URI
- GitHub：检查 GitHub OAuth App 中的 Authorization callback URL
- 应该设置为：`https://your-domain.com/api/auth/callback`

---

## 📚 相关文档

- `docs/auth-system-analysis.md` - 详细的认证系统分析
- `docs/supabase-ssr-guide.md` - Supabase SSR 使用指南
- `docs/magic-link-auth-guide.md` - Magic Link 认证指南
- `docs/question.md` - 用户相关问题记录

---

## 🎯 总结

**优点**：
✅ 多种登录方式支持  
✅ 无密码登录体验好  
✅ 自动 Session 刷新  
✅ 数据库触发器自动同步  
✅ 响应式 UI 设计  

**注意事项**：
⚠️ 需要正确配置环境变量  
⚠️ Vercel 部署时单独配置环境变量  
⚠️ 需要运行数据库迁移创建 user 表  
⚠️ OAuth 需要在对应平台配置回调地址  

---

## 🔗 快速链接

- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)
- [GitHub OAuth Apps](https://github.com/settings/developers)

