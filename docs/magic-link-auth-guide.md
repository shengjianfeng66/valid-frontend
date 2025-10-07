# Magic Link 邮箱登录功能文档

## 📧 功能概述

Magic Link（魔法链接）是一种无密码登录方式，用户只需输入邮箱，系统会发送包含登录链接的邮件，点击链接即可完成登录。

## 🎯 特点

- ✅ **无需密码** - 不用记住复杂密码
- ✅ **安全性高** - 链接有时效性，防止重放攻击
- ✅ **用户友好** - 登录流程简单直观
- ✅ **自动注册** - 新用户自动创建账户

## 🏗️ 架构设计

### 组件复用结构

```
登录入口
├── 弹框登录 (modal.tsx)
│   └── 使用共享组件
└── 独立页面 (form.tsx)
    └── 使用共享组件

共享组件
├── MagicLinkForm (magic-link-form.tsx)
│   └── Magic Link 登录表单
└── OAuthButtons (oauth-buttons.tsx)
    └── OAuth 登录按钮组
```

### 文件说明

| 文件 | 功能 | 复用性 |
|------|------|--------|
| `src/components/sign/magic-link-form.tsx` | Magic Link 表单 | ✅ 可复用 |
| `src/components/sign/oauth-buttons.tsx` | OAuth 按钮组 | ✅ 可复用 |
| `src/components/sign/modal.tsx` | 弹框登录容器 | 使用上述组件 |
| `src/components/sign/form.tsx` | 页面登录容器 | 使用上述组件 |

## 🔄 登录流程

### 1. 用户操作流程

```
用户访问网站
  ↓
点击"登录"按钮
  ↓
选择"邮箱登录"标签
  ↓
输入邮箱地址
  ↓
点击"发送登录链接"
  ↓
[系统发送邮件]
  ↓
显示"请查看您的邮箱"提示
  ↓
用户打开邮箱
  ↓
点击邮件中的 Magic Link
  ↓
跳转到 /api/auth/callback?token=xxx
  ↓
系统验证 token 并创建 session
  ↓
自动重定向到首页
  ↓
✅ 登录成功
```

### 2. 技术实现流程

```typescript
// 1. 用户输入邮箱并提交
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/api/auth/callback`,
  },
});

// 2. Supabase 发送邮件
// 邮件包含类似这样的链接：
// https://[your-project].supabase.co/auth/v1/verify?token=xxx&type=magiclink&redirect_to=http://localhost:3001/api/auth/callback

// 3. 用户点击链接，Supabase 验证后重定向到:
// http://localhost:3001/api/auth/callback?token=xxx&type=magiclink

// 4. callback 路由处理
export async function GET(request: NextRequest) {
  const code = requestUrl.searchParams.get("code");
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type");
  
  if (code || (token && type === "magiclink")) {
    const supabase = await createClient();
    
    // 验证并交换 token 获取 session
    const { error } = await supabase.auth.exchangeCodeForSession(code || token);
    
    if (!error) {
      // 创建用户 session，设置 Cookie
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  
  return NextResponse.redirect(new URL("/", request.url));
}

// 5. 后续请求自动携带 Cookie，用户已登录
```

## 📁 代码实现

### MagicLinkForm 组件

```typescript
// src/components/sign/magic-link-form.tsx
export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    
    if (!error) {
      setEmailSent(true);
      toast.success("登录链接已发送！");
    }
    
    setLoading(false);
  };
  
  // UI: 输入框 → 发送按钮 → 成功提示
}
```

### 在容器组件中使用

```typescript
// src/components/sign/modal.tsx 或 form.tsx
import MagicLinkForm from "./magic-link-form";
import OAuthButtons from "./oauth-buttons";

function LoginContainer() {
  return (
    <Tabs defaultValue="magic-link">
      <TabsList>
        <TabsTrigger value="magic-link">邮箱登录</TabsTrigger>
        <TabsTrigger value="oauth">快捷登录</TabsTrigger>
      </TabsList>
      
      <TabsContent value="magic-link">
        <MagicLinkForm />
      </TabsContent>
      
      <TabsContent value="oauth">
        <OAuthButtons />
      </TabsContent>
    </Tabs>
  );
}
```

## 🔐 安全性

### 1. Token 安全

- **一次性使用**: Token 使用后立即失效
- **时效性**: Token 默认 1 小时后过期
- **加密传输**: 使用 HTTPS 传输
- **防重放攻击**: Supabase 内置防护

### 2. 邮箱验证

- **格式验证**: 前端验证邮箱格式
- **存在性检查**: Supabase 验证邮箱有效性
- **发送频率限制**: Supabase 内置速率限制

### 3. Session 管理

- **HTTP-Only Cookie**: 防止 XSS 攻击
- **Secure Flag**: 仅在 HTTPS 下传输
- **SameSite**: 防止 CSRF 攻击

## ⚙️ Supabase 配置

### 1. 邮件模板配置

在 Supabase Dashboard → Authentication → Email Templates:

**Magic Link 模板**:
```html
<h2>登录到 {{ .SiteURL }}</h2>
<p>点击下面的链接登录:</p>
<p><a href="{{ .ConfirmationURL }}">登录</a></p>
<p>如果您没有请求此邮件，请忽略。</p>
<p>此链接将在 1 小时后过期。</p>
```

### 2. URL 配置

在 Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: http://localhost:3001 (开发)
          https://yourdomain.com (生产)

Redirect URLs: 
  - http://localhost:3001/**
  - https://yourdomain.com/**
```

### 3. 邮件服务配置

**开发环境** (使用 Supabase 内置 SMTP):
- 每小时最多发送 4 封邮件
- 用于测试目的

**生产环境** (自定义 SMTP):
- 配置自己的 SMTP 服务器（如 SendGrid、AWS SES）
- Supabase Dashboard → Project Settings → Auth → SMTP Settings

## 🎨 UI/UX 设计

### 1. 登录界面

```
┌─────────────────────────────────┐
│   邮箱登录  |  快捷登录          │
├─────────────────────────────────┤
│                                 │
│  邮箱地址                        │
│  ┌───────────────────────────┐  │
│  │ your@email.com           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  📧 发送登录链接           │  │
│  └───────────────────────────┘  │
│                                 │
│  无需密码，点击邮件中的链接即可登录 │
│                                 │
└─────────────────────────────────┘
```

### 2. 发送成功界面

```
┌─────────────────────────────────┐
│           ✓                     │
│                                 │
│      请查看您的邮箱               │
│                                 │
│  我们已向 user@email.com         │
│  发送了一封包含登录链接的邮件      │
│                                 │
│  ┌───────────────────────────┐  │
│  │  使用其他邮箱               │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

## 🧪 测试

### 本地测试步骤

1. **启动开发服务器**
   ```bash
   pnpm dev
   ```

2. **访问登录页面**
   - 弹框: http://localhost:3001 → 点击"登录"
   - 页面: http://localhost:3001/auth/signin

3. **输入测试邮箱**
   - 使用真实邮箱地址
   - 点击"发送登录链接"

4. **查看邮箱**
   - 打开邮箱收件箱
   - 查找来自 Supabase 的邮件
   - 点击登录链接

5. **验证登录**
   - 自动跳转回网站
   - 检查用户头像是否显示
   - 查看浏览器 Cookie 是否设置

### 调试技巧

**1. 查看 Network 日志**
```
浏览器开发者工具 → Network
- 查看 signInWithOtp 请求
- 查看 callback 请求
- 检查 Cookie 设置
```

**2. 查看 Supabase 日志**
```
Supabase Dashboard → Logs → Auth Logs
- 查看邮件发送记录
- 查看 token 验证记录
```

**3. 测试邮件未收到**
```
检查项:
- 邮箱地址是否正确
- 检查垃圾邮件文件夹
- 确认 Supabase SMTP 配置
- 检查发送频率限制
```

## 📝 国际化

### 中文翻译 (zh.json)

```json
{
  "sign_modal": {
    "magic_link_tab": "邮箱登录",
    "oauth_tab": "快捷登录",
    "send_magic_link": "发送登录链接",
    "sending": "发送中...",
    "magic_link_sent": "登录链接已发送！",
    "magic_link_error": "发送失败，请重试",
    "email_required": "请输入邮箱地址",
    "email_invalid": "邮箱格式不正确",
    "check_your_email": "请查看您的邮箱",
    "magic_link_description": "我们已向 {email} 发送了一封包含登录链接的邮件",
    "try_another_email": "使用其他邮箱",
    "magic_link_tip": "无需密码，点击邮件中的链接即可登录"
  }
}
```

### 英文翻译 (en.json)

```json
{
  "sign_modal": {
    "magic_link_tab": "Magic Link",
    "oauth_tab": "Quick Sign In",
    "send_magic_link": "Send Magic Link",
    "sending": "Sending...",
    "magic_link_sent": "Magic link sent!",
    "magic_link_error": "Failed to send, please try again",
    "email_required": "Email is required",
    "email_invalid": "Invalid email format",
    "check_your_email": "Check Your Email",
    "magic_link_description": "We've sent an email with a login link to {email}",
    "try_another_email": "Try Another Email",
    "magic_link_tip": "No password required, just click the link in your email"
  }
}
```

## 🚀 生产部署

### 1. 环境变量

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
```

### 2. 配置自定义 SMTP

在 Supabase Dashboard 配置:
- SMTP Host
- SMTP Port
- SMTP Username
- SMTP Password
- From Email

### 3. 自定义邮件模板

设计符合品牌的邮件样式:
- Logo
- 颜色主题
- 按钮样式
- 版权信息

## 📊 最佳实践

### 1. 用户体验

- ✅ 明确的状态反馈（加载、成功、失败）
- ✅ 友好的错误提示
- ✅ 支持重新发送
- ✅ 显示预计到达时间

### 2. 安全建议

- ✅ 限制发送频率
- ✅ 记录异常登录
- ✅ IP 白名单（可选）
- ✅ 异地登录通知（可选）

### 3. 性能优化

- ✅ 邮件发送异步处理
- ✅ 使用 CDN 加速邮件资源
- ✅ 缓存邮件模板
- ✅ 批量发送优化

## 🔧 故障排查

### 常见问题

**Q: 邮件发送失败**
```
检查:
1. Supabase SMTP 配置是否正确
2. 邮箱地址格式是否有效
3. 是否超过发送频率限制
4. 查看 Supabase Auth Logs
```

**Q: 点击链接后 404**
```
检查:
1. callback 路由是否存在
2. 回调 URL 配置是否正确
3. 中间件是否正确处理
```

**Q: 登录后立即退出**
```
检查:
1. Cookie 设置是否成功
2. Session 刷新机制
3. 浏览器 Cookie 策略
```

## 📚 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Magic Link 最佳实践](https://supabase.com/docs/guides/auth/auth-email)
- [邮件模板自定义](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**更新日期**: 2025-10-07  
**版本**: v1.0  
**作者**: Development Team

