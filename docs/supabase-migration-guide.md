# Supabase Auth 迁移完成指南

## ✅ 已完成的迁移步骤

### 1. 安装依赖
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 2. 创建的新文件
- ✅ `src/lib/supabase/server.ts` - 服务端 Supabase 客户端
- ✅ `src/lib/supabase/client.ts` - 客户端 Supabase 客户端
- ✅ `src/lib/supabase/middleware.ts` - 中间件 Session 更新工具
- ✅ `src/lib/supabase/index.ts` - 统一导出
- ✅ `src/app/auth/callback/route.ts` - OAuth 回调处理

### 3. 更新的文件
- ✅ `src/services/user.ts` - 使用 Supabase Auth 获取用户信息
- ✅ `src/components/sign/modal.tsx` - 使用 Supabase OAuth 登录
- ✅ `src/components/sign/form.tsx` - 使用 Supabase OAuth 登录
- ✅ `src/components/sign/user.tsx` - 使用 Supabase 登出
- ✅ `src/components/dashboard/sidebar/user.tsx` - 使用 Supabase 登出
- ✅ `src/app/[locale]/auth/signin/page.tsx` - 使用 Supabase 检查登录状态
- ✅ `src/middleware.ts` - 集成 Supabase Session 自动刷新
- ✅ `src/contexts/app.tsx` - 使用 Supabase Auth 状态监听
- ✅ `src/app/[locale]/layout.tsx` - 移除 NextAuthSessionProvider

### 4. 删除的文件
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API 路由（不再需要）

## 📋 后续配置步骤

### 第一步：在 Supabase Dashboard 配置 OAuth

1. **打开 Supabase Dashboard**
   - 访问: https://app.supabase.com/project/[your-project]/auth/providers

2. **配置 Google OAuth**
   - 启用 Google Provider
   - 添加 Client ID 和 Client Secret（从 Google Cloud Console 获取）
   - Callback URL: `https://[your-project].supabase.co/auth/v1/callback`
   - 在 Google Cloud Console 添加授权重定向 URI

3. **配置 GitHub OAuth**
   - 启用 GitHub Provider
   - 添加 Client ID 和 Client Secret（从 GitHub Settings 获取）
   - Callback URL: `https://[your-project].supabase.co/auth/v1/callback`
   - 在 GitHub OAuth App 添加回调 URL

### 第二步：创建数据库触发器（重要！）

在 Supabase SQL Editor 中执行以下 SQL，用于自动创建用户记录和赠送积分：

```sql
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
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'oauth',
    COALESCE(
      NEW.raw_app_meta_data->>'provider',
      NEW.raw_user_meta_data->>'provider',
      'unknown'
    ),
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

### 第三步：更新环境变量

创建 `.env.local` 文件（不要提交到 Git）：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...（从 Supabase Dashboard 获取）

# 数据库配置（使用 Supabase 数据库）
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# 认证配置
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true

# 应用配置
NEXT_PUBLIC_WEB_URL=http://localhost:3000  # 开发环境
NEXT_PUBLIC_PROJECT_NAME=YourProject
```

### 第四步：测试认证流程

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **测试登录**
   - 访问登录页面
   - 点击 Google/GitHub 登录
   - 检查是否成功跳转到 OAuth 授权页
   - 授权后检查是否正确回调并登录

3. **检查数据**
   - 在 Supabase Dashboard → Table Editor
   - 检查 `auth.users` 表是否有新用户
   - 检查 `public.users` 表是否自动创建记录
   - 检查 `public.credits` 表是否赠送积分

4. **测试登出**
   - 点击用户头像下拉菜单
   - 点击"退出登录"
   - 检查是否成功登出

## 🔍 调试技巧

### 1. 检查 Supabase 连接
```typescript
// 在任意页面临时添加
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('Supabase User:', user);
```

### 2. 检查 Cookie
- 打开浏览器开发者工具 → Application → Cookies
- 查看是否有 `sb-access-token` 和 `sb-refresh-token`

### 3. 查看 Supabase Auth 日志
- Supabase Dashboard → Logs → Auth Logs
- 可以看到所有认证相关的请求和错误

### 4. 常见问题

**Q: OAuth 回调失败**
- 检查 Supabase Dashboard 中的 Site URL 设置
- 确保 Callback URL 配置正确
- 检查 OAuth Provider 的回调 URL 配置

**Q: 用户登录成功但数据库没有记录**
- 检查数据库触发器是否创建成功
- 查看 Supabase SQL Editor → Logs
- 检查触发器函数的权限设置

**Q: Token 刷新失败**
- 检查中间件是否正确集成
- 查看浏览器控制台是否有错误
- 检查 Cookie 的 Domain 和 Path 设置

## 📝 迁移清单

- [x] 安装 Supabase 依赖
- [x] 创建 Supabase 客户端工具函数
- [x] 更新用户服务函数
- [x] 更新登录组件
- [x] 创建 OAuth 回调路由
- [x] 更新中间件
- [x] 更新所有使用 auth() 的文件
- [x] 更新环境变量配置
- [ ] 在 Supabase Dashboard 配置 OAuth Providers
- [ ] 创建数据库触发器
- [ ] 更新环境变量
- [ ] 测试登录流程
- [ ] 测试登出功能
- [ ] 测试新用户注册
- [ ] 测试积分发放

## 🚀 下一步

1. **配置生产环境**
   - 更新 Vercel/其他平台的环境变量
   - 配置正式的 OAuth 回调 URL
   - 更新 Site URL 为生产域名

2. **优化用户体验**
   - 添加加载状态提示
   - 优化错误处理
   - 添加重试机制

3. **安全增强**
   - 启用 Row Level Security (RLS)
   - 配置邮箱验证
   - 添加 MFA 支持

## 📚 参考资源

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [@supabase/ssr 文档](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)

