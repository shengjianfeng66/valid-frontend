// ============================================
// 注意：此文件已废弃
// ============================================
// 
// 项目已从 NextAuth 迁移到 Supabase Auth
// 用户创建和登录处理现在由 Supabase Auth 触发器自动完成
// 
// 触发器位置：supabase/migrations/001_setup_auth_triggers.sql
// 
// 如果需要自定义用户创建逻辑，请修改触发器中的 handle_new_user() 函数
// 
// ============================================

// 保留此文件是为了避免破坏可能存在的引用
// 可以在确认没有引用后安全删除

export async function handleSignInUser() {
  throw new Error(
    "handleSignInUser is deprecated. User creation is now handled by Supabase Auth triggers."
  );
}
