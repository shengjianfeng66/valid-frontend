-- ============================================
-- Supabase Auth 触发器设置
-- 说明：当用户通过 Supabase Auth 注册/登录时，自动创建用户记录并赠送积分
-- 创建日期：2025-10-07
-- ============================================

-- 1. 创建新用户自动处理函数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 插入到 public.user 表
  -- 使用 auth.users.id 作为 uuid（Supabase Auth 的用户ID本身就是UUID）
  INSERT INTO public.user (
    uuid,
    email,
    nickname,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,  -- Supabase Auth 的用户ID
    NEW.email,
    -- 优先使用 name，其次 full_name，最后使用邮箱前缀
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    -- 优先使用 avatar_url，其次 picture
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (uuid) DO UPDATE SET
    -- 如果用户已存在（比如之前删除后重新注册），更新信息
    email = EXCLUDED.email,
    nickname = EXCLUDED.nickname,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  -- 仅在新用户首次注册时赠送积分
  -- 使用 ON CONFLICT DO NOTHING 避免重复赠送
  INSERT INTO public.credits (
    trans_no,
    created_at,
    user_uuid,
    trans_type,
    credits,
    expired_at
  ) VALUES (
    gen_random_uuid()::text,  -- 使用 PostgreSQL 内置函数生成唯一交易号
    NOW(),
    NEW.id,
    'NewUser',  -- 交易类型：新用户注册
    1000,  -- 新用户赠送积分数量
    NOW() + INTERVAL '1 year'  -- 积分有效期：1年
  )
  ON CONFLICT (trans_no) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. 创建新触发器
-- 在 auth.users 表插入新记录后自动执行 handle_new_user 函数
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 触发器说明
-- ============================================

-- **触发时机**：
-- - 用户通过 Google OAuth 登录
-- - 用户通过 GitHub OAuth 登录
-- - 用户通过 Magic Link 邮箱登录
-- - 任何通过 Supabase Auth 创建的新用户

-- **数据映射**：
-- - auth.users.id → public.user.uuid
-- - auth.users.email → public.user.email
-- - auth.users.raw_user_meta_data.name → public.user.nickname
-- - auth.users.raw_user_meta_data.avatar_url → public.user.avatar_url

-- **积分赠送规则**：
-- - 新用户注册：1000 积分
-- - 有效期：1 年
-- - 交易类型：NewUser
-- - 防重复：使用 ON CONFLICT DO NOTHING

-- **与旧系统的区别**：
-- - ❌ 不再记录 signin_type（OAuth 类型信息）
-- - ❌ 不再记录 signin_ip（登录IP）
-- - ❌ 不再记录 signin_provider（登录提供商：google/github）
-- - ❌ 不再记录 signin_openid（第三方OpenID）
-- - ✅ 用户身份信息完全由 Supabase Auth 管理
-- - ✅ 登录历史可通过 auth.audit_log_entries 查询

-- **查询用户登录历史示例**：
-- SELECT 
--   created_at,
--   payload->>'action' as action,
--   payload->>'provider' as provider,
--   ip_address
-- FROM auth.audit_log_entries
-- WHERE user_id = 'user-uuid-here'
-- ORDER BY created_at DESC;

-- ============================================
-- 测试触发器
-- ============================================

-- 手动测试（在 Supabase SQL Editor 执行）：
-- INSERT INTO auth.users (
--   id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   raw_user_meta_data,
--   created_at,
--   updated_at
-- ) VALUES (
--   gen_random_uuid(),
--   'test@example.com',
--   crypt('password', gen_salt('bf')),
--   NOW(),
--   '{"name": "Test User", "avatar_url": "https://example.com/avatar.png"}'::jsonb,
--   NOW(),
--   NOW()
-- );

-- 验证结果：
-- SELECT * FROM public.user WHERE email = 'test@example.com';
-- SELECT * FROM public.credits WHERE user_uuid = (SELECT uuid FROM public.user WHERE email = 'test@example.com');

