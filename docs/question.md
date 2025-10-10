# 问题记录

## 问题：get-user-info 接口返回错误

### 错误信息
```json
{
  "code": -1,
  "message": "get user info failed"
}
```

### 错误详情
```
Error: Failed query: select "id", "uuid", "email", ... from "user" where "user"."uuid" = $1
PostgresError: relation "user" does not exist
```

### 问题原因

项目中有两个用户系统：

1. **Supabase Auth 用户**（负责登录认证）
   - 接口：`https://eixyepowkmnqofbgjaih.supabase.co/auth/v1/user`
   - 用户 ID: `eb2dad81-c977-4824-b511-0abeccf9cfdb`
   - ✅ 正常工作

2. **项目数据库 `user` 表**（存储业务数据）
   - 存储：积分、昵称、头像、邀请码等
   - ❌ **表不存在**，导致查询失败

### 正常流程
```
用户登录 (Supabase Auth) 
    ↓
自动创建记录到 user 表
    ↓  
get-user-info 接口查询数据
```

现在卡在第二步，因为 `user` 表不存在。

---

## 解决方案

### 方案 1：使用 Drizzle 推送 Schema（推荐）

```bash
# 在项目根目录运行
pnpm drizzle-kit push
```

这会自动创建所有缺失的数据库表。

### 方案 2：手动创建表

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 进入项目 → SQL Editor
3. 执行以下 SQL：

```sql
CREATE TABLE "user" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "uuid" varchar(255) NOT NULL UNIQUE,
  "email" varchar(255) NOT NULL,
  "created_at" timestamp with time zone,
  "nickname" varchar(255),
  "avatar_url" varchar(255),
  "locale" varchar(50),
  "invite_code" varchar(255) NOT NULL DEFAULT '',
  "updated_at" timestamp with time zone,
  "invited_by" varchar(255) NOT NULL DEFAULT '',
  "is_affiliate" boolean NOT NULL DEFAULT false
);
```

### 方案 3：运行完整迁移

在 Supabase SQL Editor 中执行：
```
src/db/migrations/0000_merged_schema.sql
```

这会创建所有必需的表（user、credits、orders 等）。

---

## 验证步骤

1. 表创建成功后，在 Supabase Dashboard 的 Table Editor 中应该能看到 `user` 表
2. 刷新浏览器页面，重新登录
3. 系统会自动同步 Supabase Auth 用户到 `user` 表
4. `/api/get-user-info` 接口应该正常返回数据

---

## 相关文件

- 错误位置：`src/app/api/get-user-info/route.ts:15`
- Schema 定义：`src/db/schema.ts:14`
- 用户模型：`src/models/user.ts:25`
- 迁移文件：`src/db/migrations/0000_merged_schema.sql`

---

## 笔记

- `user` 表的 `uuid` 字段对应 Supabase Auth 的 `id`
- 首次登录时，`saveUser()` 函数会自动创建用户记录
- 新用户会自动获得初始积分（通过 `increaseCredits()` 函数）

