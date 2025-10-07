# 数据库 Schema 说明文档

## 📋 概述

本文档说明了合并后的完整数据库 Schema，所有字段修改已直接合并到表定义中。

## 📁 文件信息

- **文件**: `src/db/migrations/0000_merged_schema.sql`
- **合并自**: 0000, 0001, 0002, 0003 四个 migration 文件
- **创建日期**: 2025-10-07

## 🗄️ 数据表结构

### 1. users (用户表)

**主要功能**: 存储用户基本信息和认证数据

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| uuid | varchar(255) | 用户唯一标识 | UNIQUE, NOT NULL |
| email | varchar(255) | 邮箱地址 | NOT NULL |
| nickname | varchar(255) | 昵称 | |
| avatar_url | varchar(255) | 头像 URL | |
| created_at | timestamp | 创建时间 | |
| updated_at | timestamp | 更新时间 | |
| locale | varchar(50) | 语言偏好 | |
| signin_type | varchar(50) | 登录类型 (oauth/credentials) | |
| signin_provider | varchar(50) | 登录提供商 (google/github) | |
| signin_openid | varchar(255) | OAuth 提供商用户ID | |
| signin_ip | varchar(255) | 登录 IP | |
| invite_code | varchar(255) | 邀请码 | DEFAULT '', NOT NULL |
| invited_by | varchar(255) | 邀请人 UUID | DEFAULT '', NOT NULL |
| is_affiliate | boolean | 是否为推广者 | DEFAULT false, NOT NULL |

**索引**:
- `email_provider_unique_idx`: (email, signin_provider) 联合唯一索引

**关联**:
- 与 `affiliates` 表：通过 user_uuid 和 invited_by
- 与 `orders` 表：通过 user_uuid
- 与 `credits` 表：通过 user_uuid
- 与 `apikeys` 表：通过 user_uuid

---

### 2. orders (订单表)

**主要功能**: 存储支付订单信息

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| order_no | varchar(255) | 订单号 | UNIQUE, NOT NULL |
| user_uuid | varchar(255) | 用户 UUID | DEFAULT '', NOT NULL |
| user_email | varchar(255) | 用户邮箱 | DEFAULT '', NOT NULL |
| amount | integer | 金额（分） | NOT NULL |
| currency | varchar(50) | 货币类型 | |
| interval | varchar(50) | 订阅周期 (one-time/month/year) | |
| status | varchar(50) | 订单状态 | NOT NULL |
| credits | integer | 积分数量 | NOT NULL |
| product_id | varchar(255) | 产品 ID | |
| product_name | varchar(255) | 产品名称 | |
| valid_months | integer | 有效月数 | |
| stripe_session_id | varchar(255) | Stripe 会话 ID | |
| created_at | timestamp | 创建时间 | |
| expired_at | timestamp | 过期时间 | |
| paid_at | timestamp | 支付时间 | |
| paid_email | varchar(255) | 支付邮箱 | |
| paid_detail | text | 支付详情 | |
| order_detail | text | 订单详情 | |

**订阅相关字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| sub_id | varchar(255) | 订阅 ID |
| sub_interval_count | integer | 订阅间隔数 |
| sub_cycle_anchor | integer | 订阅周期锚点 |
| sub_period_start | integer | 订阅周期开始 |
| sub_period_end | integer | 订阅周期结束 |
| sub_times | integer | 订阅次数 |

**关联**:
- 关联 `users` 表：user_uuid
- 关联 `credits` 表：order_no
- 关联 `affiliates` 表：paid_order_no

---

### 3. credits (积分记录表)

**主要功能**: 存储用户积分交易记录

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| trans_no | varchar(255) | 交易号 | UNIQUE, NOT NULL |
| user_uuid | varchar(255) | 用户 UUID | NOT NULL |
| trans_type | varchar(50) | 交易类型 | NOT NULL |
| credits | integer | 积分数量（可正可负） | NOT NULL |
| order_no | varchar(255) | 关联订单号 | |
| created_at | timestamp | 创建时间 | |
| expired_at | timestamp | 过期时间 | |

**交易类型** (trans_type):
- `NewUser`: 新用户注册赠送
- `PaidOrder`: 付费订单获得
- `Invited`: 邀请奖励
- `Refund`: 退款

**关联**:
- 关联 `users` 表：user_uuid
- 关联 `orders` 表：order_no

---

### 4. affiliates (推广联盟表)

**主要功能**: 存储邀请关系和奖励记录

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| user_uuid | varchar(255) | 被邀请用户 UUID | NOT NULL |
| invited_by | varchar(255) | 邀请人 UUID | NOT NULL |
| status | varchar(50) | 状态 | DEFAULT '', NOT NULL |
| paid_order_no | varchar(255) | 付费订单号 | DEFAULT '', NOT NULL |
| paid_amount | integer | 付费金额 | DEFAULT 0, NOT NULL |
| reward_percent | integer | 奖励比例 | DEFAULT 0, NOT NULL |
| reward_amount | integer | 奖励金额 | DEFAULT 0, NOT NULL |
| created_at | timestamp | 创建时间 | |

**状态** (status):
- `pending`: 待付费
- `completed`: 已完成（用户已付费）

**关联**:
- 关联 `users` 表：user_uuid, invited_by
- 关联 `orders` 表：paid_order_no

---

### 5. apikeys (API 密钥表)

**主要功能**: 存储用户 API 密钥

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| api_key | varchar(255) | API 密钥 | UNIQUE, NOT NULL |
| title | varchar(100) | 密钥标题 | |
| user_uuid | varchar(255) | 用户 UUID | NOT NULL |
| status | varchar(50) | 状态 | |
| created_at | timestamp | 创建时间 | |

**关联**:
- 关联 `users` 表：user_uuid

---

### 6. posts (文章表)

**主要功能**: 存储文章/博客内容

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| uuid | varchar(255) | 文章唯一标识 | UNIQUE, NOT NULL |
| slug | varchar(255) | URL 别名 | |
| title | varchar(255) | 标题 | |
| description | text | 描述 | |
| content | text | 内容 | |
| cover_url | varchar(255) | 封面图 URL | |
| author_name | varchar(255) | 作者名称 | |
| author_avatar_url | varchar(255) | 作者头像 URL | |
| locale | varchar(50) | 语言 | |
| status | varchar(50) | 状态 | |
| **category_uuid** | **varchar(255)** | **分类 UUID** | **✨ 来自 0003** |
| created_at | timestamp | 创建时间 | |
| updated_at | timestamp | 更新时间 | |

**关联**:
- 关联 `categories` 表：category_uuid

---

### 7. categories (分类表)

**主要功能**: 存储文章分类

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| uuid | varchar(255) | 分类唯一标识 | UNIQUE, NOT NULL |
| name | varchar(255) | 分类名称（英文） | UNIQUE, NOT NULL |
| title | varchar(255) | 分类标题（显示） | NOT NULL |
| description | text | 描述 | |
| status | varchar(50) | 状态 | |
| **sort** | **integer** | **排序** | **DEFAULT 0, NOT NULL ✨ 来自 0002** |
| **created_at** | **timestamp** | **创建时间** | **✨ 来自 0002** |
| **updated_at** | **timestamp** | **更新时间** | **✨ 来自 0002** |

**关联**:
- 与 `posts` 表：通过 category_uuid

---

### 8. feedbacks (反馈表)

**主要功能**: 存储用户反馈

| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | integer | 自增主键 | PRIMARY KEY |
| user_uuid | varchar(255) | 用户 UUID | |
| content | text | 反馈内容 | |
| rating | integer | 评分 | |
| status | varchar(50) | 状态 | |
| created_at | timestamp | 创建时间 | |

**关联**:
- 关联 `users` 表：user_uuid

---

## 📊 表关系图

```
users
  ├── orders (user_uuid)
  │   └── credits (order_no)
  ├── credits (user_uuid)
  ├── apikeys (user_uuid)
  ├── feedbacks (user_uuid)
  └── affiliates
      ├── user_uuid (被邀请人)
      └── invited_by (邀请人)

categories
  └── posts (category_uuid)
```

## 🔄 合并说明

### 来自 0000_wealthy_squirrel_girl.sql
- ✅ affiliates 表
- ✅ apikeys 表
- ✅ credits 表
- ✅ feedbacks 表
- ✅ orders 表
- ✅ posts 表（基础结构）
- ✅ users 表
- ✅ email_provider_unique_idx 索引

### 来自 0001_thankful_prodigy.sql
- ✅ categories 表（基础结构）

### 来自 0002_needy_brother_voodoo.sql
- ✅ categories 表添加字段：
  - `sort` - 排序
  - `created_at` - 创建时间
  - `updated_at` - 更新时间

### 来自 0003_steady_toad.sql
- ✅ posts 表添加字段：
  - `category_uuid` - 分类关联

## 🚀 使用方法

### 方法 1: 直接执行 SQL（推荐用于全新数据库）

```bash
# 在 Supabase SQL Editor 中执行
# 复制 src/db/migrations/0000_merged_schema.sql 的内容并执行
```

### 方法 2: 使用 Drizzle ORM

```bash
# 1. 确保 schema.ts 与 SQL 一致
# 2. 推送到数据库
pnpm db:push

# 或使用 migration
pnpm db:generate
pnpm db:migrate
```

## ⚠️ 注意事项

1. **全新数据库**: 直接使用 `0000_merged_schema.sql`
2. **现有数据库**: 如果已经运行过 0000-0003，请勿重复执行
3. **数据迁移**: 此文件不包含数据迁移，仅包含表结构
4. **备份**: 在执行前请备份现有数据

## 📝 字段命名规范

- 主键: `id`
- UUID: `uuid`
- 外键: `{table}_uuid` (如 user_uuid)
- 时间: `created_at`, `updated_at`, `expired_at`
- 状态: `status`
- 数量: 复数形式 (如 credits)

## 🔐 安全建议

### Row Level Security (RLS)

建议在 Supabase 中为每个表启用 RLS：

```sql
-- 用户只能查看自己的数据
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = uuid);

-- 类似地为其他表设置 RLS
```

### 索引优化

常用查询字段建议添加索引：

```sql
-- 用户邮箱查询
CREATE INDEX idx_users_email ON users(email);

-- 订单查询
CREATE INDEX idx_orders_user_uuid ON orders(user_uuid);
CREATE INDEX idx_orders_status ON orders(status);

-- 积分查询
CREATE INDEX idx_credits_user_uuid ON credits(user_uuid);
CREATE INDEX idx_credits_expired_at ON credits(expired_at);
```

---

**文档版本**: v1.0  
**创建日期**: 2025-10-07  
**维护者**: Development Team

