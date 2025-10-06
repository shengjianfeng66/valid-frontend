# 用户认证系统技术文档

## 一、当前认证系统架构

### 1.1 技术栈
- **认证框架**: NextAuth.js v5.0.0-beta.25
- **数据库**: PostgreSQL (通过 Drizzle ORM)
- **Session管理**: JWT Token
- **支持的登录方式**:
  - Google OAuth
  - GitHub OAuth
  - Google One Tap (一键登录)

### 1.2 核心配置文件

#### 认证配置 (`src/auth/config.ts`)
```typescript
主要功能：
- 配置多种OAuth Provider (Google, GitHub, Google One Tap)
- 定义认证回调函数
- 管理Session和JWT Token
```

**关键回调函数：**

1. **signIn回调**: 控制用户是否允许登录
2. **redirect回调**: 处理登录后的重定向逻辑
3. **session回调**: 将JWT中的用户信息注入到session
4. **jwt回调**: 
   - 用户首次登录时调用 `handleSignInUser`
   - 保存/更新用户信息到数据库
   - 将用户核心信息存储到JWT Token中

### 1.3 认证流程

```
用户点击登录 
  ↓
选择登录方式 (Google/GitHub/Google One Tap)
  ↓
OAuth Provider 验证
  ↓
jwt回调触发 → handleSignInUser
  ↓
检查用户是否存在于数据库
  ↓
├─ 不存在 → 创建新用户 + 赠送新用户积分
└─ 已存在 → 返回用户信息
  ↓
生成JWT Token (包含: uuid, email, nickname, avatar_url, created_at)
  ↓
session回调 → 将用户信息注入session
  ↓
登录成功
```

## 二、Session管理方案

### 2.1 Session提供者
位置: `src/auth/session.tsx`

```typescript
"use client";
import { SessionProvider } from "next-auth/react";

// 客户端Session Provider
export function NextAuthSessionProvider({ children }) {
  if (!isAuthEnabled()) return <>{children}</>;
  return <SessionProvider>{children}</SessionProvider>;
}
```

### 2.2 Session数据结构

**JWT Token 结构** (`src/types/next-auth.d.ts`):
```typescript
interface JWT {
  user?: {
    uuid?: string;          // 用户唯一标识
    nickname?: string;      // 昵称
    avatar_url?: string;    // 头像URL
    created_at?: string;    // 创建时间
  };
}

interface Session {
  user: {
    uuid?: string;
    nickname?: string;
    avatar_url?: string;
    created_at?: string;
    email?: string;         // 继承自DefaultSession
    name?: string;          // 继承自DefaultSession
    image?: string;         // 继承自DefaultSession
  }
}
```

### 2.3 Session获取方式

**服务端获取Session:**
```typescript
import { auth } from "@/auth";

// 在Server Component或API Route中
const session = await auth();
if (session?.user?.uuid) {
  const userUuid = session.user.uuid;
}
```

**客户端获取Session:**
```typescript
import { useSession } from "next-auth/react";

// 在Client Component中
const { data: session, status } = useSession();
```

### 2.4 用户UUID获取服务
位置: `src/services/user.ts`

```typescript
// 支持两种方式获取用户UUID:
// 1. 从Session中获取
// 2. 从API Key中获取 (Bearer Token格式)
export async function getUserUuid() {
  // 优先检查API Key
  const token = await getBearerToken();
  if (token?.startsWith("sk-")) {
    return await getUserUuidByApiKey(token);
  }
  
  // 从Session获取
  const session = await auth();
  return session?.user?.uuid || "";
}
```

## 三、登录页面实现

### 3.1 登录页面路由
- **专用登录页**: `/[locale]/auth/signin/page.tsx`
- **登录弹窗**: `src/components/sign/modal.tsx` (用于首页快捷登录)

### 3.2 登录组件结构

**登录按钮** (`src/components/sign/sign_in.tsx`):
```typescript
- 点击触发显示登录Modal
- 使用AppContext管理Modal状态
```

**登录Modal** (`src/components/sign/modal.tsx`):
```typescript
功能：
- 响应式设计 (桌面端Dialog，移动端Drawer)
- 支持多种OAuth登录方式
- 通过环境变量控制显示哪些登录选项
```

### 3.3 登录方式配置

通过环境变量控制启用的登录方式：
```bash
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED=true

AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx
AUTH_GITHUB_ID=xxx
AUTH_GITHUB_SECRET=xxx
```

## 四、用户数据模型

### 4.1 数据库Schema (`src/db/schema.ts`)

```typescript
users表结构:
- id: 自增主键
- uuid: 用户唯一标识 (业务主键)
- email: 邮箱
- nickname: 昵称
- avatar_url: 头像URL
- created_at: 创建时间
- signin_type: 登录类型 (oauth/credentials)
- signin_provider: 登录提供商 (google/github)
- signin_openid: OAuth提供商的用户ID
- signin_ip: 登录IP
- invite_code: 邀请码
- invited_by: 邀请人UUID
- is_affiliate: 是否为推广者
- locale: 语言偏好
- updated_at: 更新时间

唯一索引: (email, signin_provider)
```

### 4.2 用户类型定义 (`src/types/user.d.ts`)

```typescript
interface User {
  uuid?: string;
  email: string;
  nickname: string;
  avatar_url: string;
  invite_code?: string;      // 用户的邀请码
  invited_by?: string;       // 邀请人UUID
  is_affiliate?: boolean;    // 是否为推广者
  credits?: UserCredits;     // 积分信息
  // ... 其他字段
}

interface UserCredits {
  one_time_credits?: number;    // 一次性积分
  monthly_credits?: number;     // 月度积分
  total_credits?: number;       // 总积分
  used_credits?: number;        // 已使用积分
  left_credits: number;         // 剩余积分
  free_credits?: number;        // 免费积分
  is_recharged?: boolean;       // 是否充值过
  is_pro?: boolean;            // 是否为Pro用户
}
```

## 五、付费系统与用户关系

### 5.1 订单系统

#### Orders表结构 (`src/db/schema.ts`)
```typescript
orders表:
- order_no: 订单号 (唯一)
- user_uuid: 用户UUID (关联users表)
- user_email: 用户邮箱
- amount: 金额
- credits: 积分数量
- status: 订单状态 (created/paid/cancelled)
- stripe_session_id: Stripe会话ID
- interval: 订阅周期 (one-time/month/year)
- expired_at: 过期时间
- paid_at: 支付时间
- paid_email: 支付邮箱
- product_id: 产品ID
- product_name: 产品名称
// 订阅相关字段
- sub_id: 订阅ID
- sub_interval_count: 订阅间隔数
- sub_cycle_anchor: 订阅周期锚点
- sub_period_start/end: 订阅周期起止
- sub_times: 订阅次数
```

### 5.2 付费流程

```
用户点击付费
  ↓
检查用户登录状态 (getUserUuid)
  ↓
创建订单 (order_no, user_uuid, user_email)
  ↓
调用Stripe/Creem创建支付会话
  ↓
用户完成支付
  ↓
支付回调 → updateOrder
  ↓
订单状态: created → paid
  ↓
增加用户积分 (updateCreditForOrder)
  ↓
处理推广奖励 (updateAffiliateForOrder)
```

### 5.3 积分系统

#### Credits表结构
```typescript
credits表:
- trans_no: 交易号 (唯一)
- user_uuid: 用户UUID
- trans_type: 交易类型
  * NewUser: 新用户赠送
  * PaidOrder: 付费订单
  * Invited: 邀请奖励
  * Refund: 退款
- credits: 积分数量 (可正可负)
- order_no: 关联订单号
- expired_at: 过期时间
```

#### 积分发放场景
1. **新用户注册**: 自动赠送积分 (CreditsAmount.NewUserGet)
2. **付费订单**: 按订单credits字段发放
3. **邀请奖励**: 通过Affiliate系统发放
4. **订阅续费**: 每次扣款后自动发放

## 六、邀请推广系统与用户关系

### 6.1 Affiliate系统架构

#### Affiliates表结构
```typescript
affiliates表:
- user_uuid: 被邀请用户UUID
- invited_by: 邀请人UUID
- status: 状态 (pending/completed)
- paid_order_no: 付费订单号
- paid_amount: 付费金额
- reward_percent: 奖励比例
- reward_amount: 奖励金额
```

### 6.2 邀请流程

```
用户A生成邀请码
  ↓
用户B通过邀请链接注册
  ↓
调用 /api/update-invite
  ↓
验证邀请码 → 查找邀请人
  ↓
更新用户B的 invited_by = 用户A的uuid
  ↓
创建Affiliate记录 (status: pending)
  ↓
用户B完成首次付费
  ↓
updateAffiliateForOrder触发
  ↓
更新Affiliate记录 (status: completed, 记录订单信息)
  ↓
发放邀请奖励给用户A
```

### 6.3 邀请码管理

**用户设置邀请码** (`/api/update-invite-code`):
- 每个用户可以自定义自己的邀请码
- 邀请码必须唯一
- 格式: `{WEB_URL}/i/{invite_code}`

**邀请奖励规则** (`src/services/constant.ts`):
```typescript
// 邀请注册奖励
AffiliateRewardPercent.Invited
AffiliateRewardAmount.Invited

// 邀请付费奖励
AffiliateRewardPercent.Paied
AffiliateRewardAmount.Paied
```

## 七、关键业务逻辑

### 7.1 新用户注册流程

```typescript
// src/auth/handler.ts → handleSignInUser
1. OAuth认证成功
2. 查询用户是否存在 (findUserByEmail)
3. 不存在:
   - 生成UUID
   - 保存用户信息
   - 赠送新用户积分 (有效期1年)
4. 已存在:
   - 返回数据库中的用户信息
```

### 7.2 付费成功处理

```typescript
// src/services/order.ts → updateOrder
1. 验证订单状态 (created → paid)
2. 更新订单支付信息
3. 增加用户积分 (updateCreditForOrder)
4. 处理推广奖励 (updateAffiliateForOrder)
```

### 7.3 订阅续费处理

```typescript
// src/services/order.ts → updateSubOrder
1. Stripe webhook通知续费
2. 创建新的续费订单 (order_no_2, order_no_3...)
3. 订单状态直接为paid
4. 增加用户积分
5. 不重复计算推广奖励
```

## 八、与Supabase Auth的适配性分析

### 8.1 当前系统特点

✅ **优势:**
1. 使用标准PostgreSQL，与Supabase兼容
2. 使用Drizzle ORM，可以无缝连接Supabase数据库
3. 业务逻辑与认证系统解耦
4. 使用UUID作为用户主键，符合Supabase规范

⚠️ **需要调整的部分:**
1. Session管理: NextAuth JWT → Supabase Session
2. OAuth配置: NextAuth Providers → Supabase Auth Providers
3. 回调处理: NextAuth callbacks → Supabase Auth Hooks/Triggers
4. 中间件: NextAuth middleware → Supabase middleware

### 8.2 适配Supabase Auth方案

#### 方案A: 完全迁移 (推荐用于新项目)

**迁移步骤:**

1. **安装Supabase依赖**
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

2. **配置Supabase Client**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // ... cookie配置
  )
}
```

3. **替换认证逻辑**
```typescript
// 替换: const session = await auth()
// 为: const supabase = createClient()
//     const { data: { user } } = await supabase.auth.getUser()
```

4. **数据库集成**
```typescript
// 当前: 
const dbClient = postgres(DATABASE_URL)

// 改为:
const dbClient = postgres(SUPABASE_DATABASE_URL)
// 或直接使用Supabase客户端
const { data } = await supabase.from('users').select()
```

5. **使用Supabase Auth Hooks**
```sql
-- 替换handleSignInUser逻辑
-- 在Supabase创建Database Trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (uuid, email, nickname, avatar_url, ...)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    ...
  );
  
  -- 赠送新用户积分
  INSERT INTO public.credits (...)
  VALUES (...);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

6. **OAuth配置迁移**
```
NextAuth Provider配置 
  → Supabase Dashboard → Authentication → Providers
     - 配置Google OAuth
     - 配置GitHub OAuth
```

**优点:**
- 原生Supabase生态
- 更好的实时功能集成
- Row Level Security (RLS) 支持
- 无需自己管理OAuth配置

**缺点:**
- 需要大量代码重构
- 学习成本较高
- 可能影响现有业务

#### 方案B: 混合模式 (推荐用于现有项目)

**保留NextAuth，使用Supabase作为数据库:**

1. **当前架构保持不变**
2. **只需修改数据库连接:**

```typescript
// .env
DATABASE_URL=postgresql://postgres:[password]@[supabase-host]:5432/postgres

// 或使用Supabase Connection Pooler
DATABASE_URL=postgresql://postgres:[password]@[supabase-host]:6543/postgres?pgbouncer=true
```

3. **利用Supabase功能:**
- 使用Supabase Dashboard管理数据
- 使用Supabase Storage存储用户头像
- 使用Supabase Realtime同步数据

**优点:**
- 最小改动
- 快速迁移
- 可以逐步集成Supabase功能

**缺点:**
- 无法使用Supabase Auth的高级功能
- 需要维护两套认证逻辑

#### 方案C: 渐进式迁移

1. **第一阶段**: 数据库迁移到Supabase
2. **第二阶段**: 新功能使用Supabase Auth
3. **第三阶段**: 逐步替换NextAuth为Supabase Auth

### 8.3 迁移检查清单

**数据迁移:**
- [ ] 导出当前PostgreSQL数据
- [ ] 在Supabase创建对应Schema
- [ ] 导入数据到Supabase
- [ ] 验证数据完整性

**认证迁移 (如果选择方案A):**
- [ ] 配置Supabase OAuth Providers
- [ ] 创建Auth Triggers/Functions
- [ ] 更新Session管理代码
- [ ] 更新中间件
- [ ] 测试登录流程

**业务逻辑调整:**
- [ ] 替换getUserUuid等工具函数
- [ ] 更新API Routes中的认证检查
- [ ] 调整积分、订单、邀请系统的用户关联逻辑
- [ ] 更新前端Session hooks

**环境变量:**
```bash
# Supabase相关
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_DATABASE_URL=postgresql://...

# 可选: 保留用于迁移期间
AUTH_SECRET=xxx
AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx
```

### 8.4 最终建议

**对于当前项目:**
✅ **推荐方案B (混合模式)**
- 将数据库迁移到Supabase
- 保留NextAuth认证系统
- 逐步集成Supabase的其他功能

**理由:**
1. **最小风险**: 不需要大规模重构
2. **快速见效**: 立即获得Supabase的数据库管理优势
3. **灵活性**: 可以根据需要逐步迁移到Supabase Auth
4. **业务连续性**: 不影响现有用户和订单系统

**后续优化:**
- 评估Supabase Auth的高级功能需求
- 如果需要实时功能，可以考虑完全迁移
- 使用Supabase Edge Functions替代部分API Routes

## 九、系统安全性

### 9.1 认证安全
- JWT Token存储在HTTP-Only Cookie
- OAuth 2.0标准流程
- CSRF保护 (NextAuth内置)
- Session过期自动处理

### 9.2 数据安全
- 用户密码不存储 (仅OAuth)
- 敏感信息加密存储
- 数据库连接池管理
- SQL注入防护 (Drizzle ORM)

### 9.3 业务安全
- 订单状态机控制
- 积分交易记录审计
- 邀请关系防作弊检查
- API Key访问控制

## 十、性能优化

### 10.1 数据库优化
- 使用UUID索引
- email + signin_provider 联合唯一索引
- 连接池配置 (max: 10)
- 查询结果缓存 (可选)

### 10.2 Session优化
- JWT Token减少数据库查询
- Session数据最小化
- 客户端缓存Session状态

### 10.3 API优化
- 统一的用户UUID获取服务
- 批量查询支持
- 分页查询实现

## 附录

### A. 关键API端点

| 端点 | 方法 | 功能 | 认证要求 |
|------|------|------|----------|
| `/api/auth/signin` | GET | NextAuth登录页 | 否 |
| `/api/auth/callback/*` | GET/POST | OAuth回调 | 否 |
| `/api/checkout` | POST | 创建支付订单 | 是 |
| `/api/pay/callback/*` | GET | 支付回调 | 否 |
| `/api/update-invite` | POST | 更新邀请关系 | 是 |
| `/api/update-invite-code` | POST | 设置邀请码 | 是 |
| `/api/get-user-info` | GET | 获取用户信息 | 是 |
| `/api/get-user-credits` | GET | 获取用户积分 | 是 |

### B. 环境变量清单

```bash
# 认证
NEXT_PUBLIC_AUTH_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=true
NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED=true

AUTH_SECRET=xxx
AUTH_GOOGLE_ID=xxx
AUTH_GOOGLE_SECRET=xxx
AUTH_GITHUB_ID=xxx
AUTH_GITHUB_SECRET=xxx

# 数据库
DATABASE_URL=postgresql://...

# 支付
PAY_PROVIDER=stripe  # 或 creem
STRIPE_PRIVATE_KEY=xxx
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=xxx

# 应用
NEXT_PUBLIC_WEB_URL=https://yourdomain.com
NEXT_PUBLIC_PROJECT_NAME=YourProject
```

### C. 数据库Migration文件位置

- Schema定义: `src/db/schema.ts`
- Migration文件: `src/db/migrations/`
- Drizzle配置: `src/db/config.ts`

### D. 类型定义文件

- User类型: `src/types/user.d.ts`
- Order类型: `src/types/order.d.ts`
- Affiliate类型: `src/types/affiliate.d.ts`
- NextAuth扩展: `src/types/next-auth.d.ts`

---

**文档版本**: v1.0  
**创建日期**: 2025-10-06  
**维护者**: Development Team  
**最后更新**: 2025-10-06

