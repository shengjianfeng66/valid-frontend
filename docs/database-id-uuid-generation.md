# 数据库ID与UUID生成机制说明

## 📌 概述

本项目数据库采用**双主键设计**：
- **`id`**：物理主键，PostgreSQL自增整数，用于数据库内部索引和性能优化
- **`uuid`**：业务主键，UUID v4 格式，用于外部引用和业务逻辑关联

---

## 1️⃣ 物理主键 `id` 生成规则

### 定义方式

**Drizzle ORM Schema定义**（`src/db/schema.ts`）：
```typescript
id: integer().primaryKey().generatedAlwaysAsIdentity()
```

**对应的PostgreSQL SQL**：
```sql
"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
    sequence name "表名_id_seq"      -- 序列名称
    INCREMENT BY 1                    -- 每次递增1
    MINVALUE 1                        -- 最小值
    MAXVALUE 2147483647               -- 最大值（32位整数）
    START WITH 1                      -- 起始值
    CACHE 1                           -- 缓存大小
)
```

### 特点

| 特性 | 说明 |
|------|------|
| **生成时机** | 数据库插入时自动生成 |
| **生成方式** | PostgreSQL序列（Sequence） |
| **初始值** | 1 |
| **递增规则** | 每次 +1 |
| **最大值** | 2,147,483,647（约21亿） |
| **唯一性** | 表级别唯一 |
| **应用层干预** | ❌ 不需要，完全由数据库管理 |

### 各表序列名称

| 表名 | 序列名称 | 当前用途 |
|------|---------|---------|
| `users` | `users_id_seq` | 用户主键 |
| `orders` | `orders_id_seq` | 订单主键 |
| `apikeys` | `apikeys_id_seq` | API密钥主键 |
| `credits` | `credits_id_seq` | 积分交易主键 |
| `categories` | `categories_id_seq` | 分类主键 |
| `posts` | `posts_id_seq` | 文章主键 |
| `affiliates` | `affiliates_id_seq` | 推广联盟主键 |
| `feedbacks` | `feedbacks_id_seq` | 反馈主键 |

---

## 2️⃣ 业务主键 `uuid` 生成规则

### 生成函数

**位置**：`src/lib/hash.ts`

```typescript
import { v4 as uuidv4 } from "uuid";

export function getUuid(): string {
  return uuidv4();
}
```

### UUID v4 特性

| 特性 | 说明 |
|------|------|
| **格式** | `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` |
| **长度** | 36个字符（含4个连字符） |
| **示例** | `550e8400-e29b-41d4-a716-446655440000` |
| **生成算法** | 随机数生成（RFC 4122 v4） |
| **碰撞概率** | 极低（2^122 种可能性） |
| **全局唯一性** | ✅ 理论上全局唯一 |

### 生成时机

#### 1. **用户创建时**（`src/services/user.ts`）

```typescript
export async function saveUser(user: User) {
  const existUser = await findUserByEmail(user.email);
  
  if (!existUser) {
    // 新用户：如果没有uuid，则生成
    if (!user.uuid) {
      user.uuid = getUuid();  // 👈 生成UUID
    }
    
    await insertUser(user as typeof users.$inferInsert);
    
    // 为新用户发放积分
    await increaseCredits({
      user_uuid: user.uuid,  // 👈 使用UUID关联
      trans_type: CreditsTransType.NewUser,
      credits: CreditsAmount.NewUserGet,
      expired_at: getOneYearLaterTimestr(),
    });
  }
  
  return user;
}
```

**调用链**：
```
用户登录 
  → src/auth/handler.ts (handleSignInUser)
    → src/services/user.ts (saveUser)
      → src/lib/hash.ts (getUuid) ✅
```

#### 2. **分类创建时**（`src/app/[locale]/(admin)/admin/categories/add/page.tsx`）

```typescript
const newCategory = await insertCategory({
  uuid: getUuid(),  // 👈 生成UUID
  name: values.name,
  title: values.title,
  description: values.description,
  status: values.status,
});
```

#### 3. **文章创建时**（`src/app/[locale]/(admin)/admin/posts/add/page.tsx`）

```typescript
const newPost = await insertPost({
  uuid: getUuid(),  // 👈 生成UUID
  slug: values.slug,
  title: values.title,
  content: values.content,
  // ...
});
```

#### 4. **Supabase Auth 用户**

对于 Supabase Auth 登录的用户，其 UUID 直接来源于 Supabase 的 `user.id`：

```typescript
// src/services/user.ts
export async function getUserUuid() {
  let user_uuid = "";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && user.id) {
    user_uuid = user.id;  // 👈 直接使用 Supabase 的 user.id
  }
  
  return user_uuid;
}
```

**注意**：Supabase 的 `user.id` 本身就是 UUID 格式。

---

## 3️⃣ 其他唯一标识符生成方式

项目中还使用了其他几种唯一标识符：

### 3.1 订单号（Order Number）

**位置**：`src/lib/hash.ts` - `getUniSeq()`

```typescript
export function getUniSeq(prefix: string = ""): string {
  const timestamp = Date.now().toString(36);        // 36进制时间戳
  const randomPart = Math.random().toString(36).substring(2, 8);  // 随机字符
  
  return `${prefix}${randomPart}${timestamp}`;
}
```

**示例**：
```typescript
getUniSeq("ORD_")  // → "ORD_4k2lm1n9p8q7"
```

**用途**：
- `orders.order_no`：订单编号
- `credits.trans_no`：交易流水号

### 3.2 随机字符串（Nonce String）

**位置**：`src/lib/hash.ts` - `getNonceStr()`

```typescript
export function getNonceStr(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * characters.length)];
  }
  
  return result;
}
```

**用途**：
- API签名
- 临时令牌

### 3.3 Snowflake ID

**位置**：`src/lib/hash.ts` - `getSnowId()`

```typescript
import { SnowflakeIdv1 } from "simple-flakeid";

export function getSnowId(): string {
  const gen = new SnowflakeIdv1({ workerId: 1 });
  return gen.NextId().toString();
}
```

**特点**：
- 分布式唯一ID
- 时间有序
- 高性能

**当前使用情况**：代码中已定义，但暂未在数据库表中使用。

---

## 4️⃣ UUID 使用场景对比

| 场景 | 使用字段 | 原因 |
|------|---------|------|
| **用户关联** | `user_uuid` | 跨系统唯一，不暴露用户数量 |
| **订单查询** | `order_no` | 友好的订单编号，易于客服沟通 |
| **分类关联** | `category_uuid` | 避免分类ID变化影响文章 |
| **API调用** | `api_key` | 长随机字符串，安全性高 |
| **数据库内部关联** | `id` | 性能最优，索引效率高 |

---

## 5️⃣ 设计优势

### ✅ 双主键设计的优势

1. **性能优化**：
   - `id`：整数主键，索引效率高，JOIN性能好
   - `uuid`：业务主键，跨系统唯一

2. **安全性**：
   - 对外暴露UUID，不泄露数据量信息
   - 不可预测，防止枚举攻击

3. **扩展性**：
   - UUID支持分布式系统
   - 迁移、合并数据库时无需重新分配ID

4. **兼容性**：
   - 兼容 Supabase Auth 的UUID体系
   - 兼容 NextAuth 的自定义UUID生成

---

## 6️⃣ 代码调用示例

### 创建新用户

```typescript
import { getUuid } from "@/lib/hash";
import { insertUser } from "@/models/user";

const newUser = await insertUser({
  uuid: getUuid(),           // 👈 业务主键
  email: "user@example.com",
  nickname: "John Doe",
  // id 字段会自动生成，无需传入
});

console.log(newUser.id);     // 1, 2, 3, ...
console.log(newUser.uuid);   // "550e8400-e29b-41d4-a716-446655440000"
```

### 查询用户

```typescript
// 通过 UUID 查询（推荐用于业务逻辑）
const user = await findUserByUuid("550e8400-e29b-41d4-a716-446655440000");

// 通过 ID 查询（用于数据库内部关联）
const user = await db()
  .select()
  .from(users)
  .where(eq(users.id, 1));
```

---

## 7️⃣ 注意事项

### ⚠️ 不要手动设置 `id`

```typescript
// ❌ 错误：试图手动设置id
await insertUser({
  id: 999,  // PostgreSQL会报错！
  uuid: getUuid(),
  email: "test@example.com",
});

// ✅ 正确：让数据库自动生成id
await insertUser({
  uuid: getUuid(),
  email: "test@example.com",
});
```

### ⚠️ UUID 必须在插入前生成

```typescript
// ❌ 错误：期望数据库自动生成UUID
await insertUser({
  email: "test@example.com",
  // uuid 未提供，会导致 NOT NULL 约束失败
});

// ✅ 正确：应用层生成UUID
await insertUser({
  uuid: getUuid(),
  email: "test@example.com",
});
```

### ⚠️ Supabase Auth 用户的特殊处理

```typescript
// Supabase Auth 登录的用户，uuid 直接使用 Supabase 的 user.id
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  await saveUser({
    uuid: user.id,  // 👈 使用 Supabase 的 ID
    email: user.email,
    // ...
  });
}
```

---

## 8️⃣ 总结

| 标识符类型 | 生成方式 | 生成时机 | 用途 |
|-----------|---------|---------|------|
| **`id`** | PostgreSQL自增 | 数据库插入时 | 物理主键，内部索引 |
| **`uuid`** | UUID v4 | 应用层创建记录前 | 业务主键，外部引用 |
| **`order_no`** | 时间戳+随机数 | 创建订单时 | 订单编号 |
| **`trans_no`** | 时间戳+随机数 | 积分交易时 | 交易流水号 |
| **`api_key`** | 随机字符串 | 创建API密钥时 | API认证 |

---

## 📚 相关文件

- 🔧 **ID生成工具**：`src/lib/hash.ts`
- 📊 **数据库Schema**：`src/db/schema.ts`
- 👤 **用户服务**：`src/services/user.ts`
- 🔐 **认证处理**：`src/auth/handler.ts`
- 📝 **SQL定义**：`src/db/migrations/0000_merged_schema.sql`

---

**文档版本**：1.0  
**最后更新**：2025-10-07  
**维护者**：开发团队

