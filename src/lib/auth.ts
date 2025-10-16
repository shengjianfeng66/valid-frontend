export function isAuthEnabled(): boolean {
  // return (
  //   !!(
  //     process.env.NEXT_PUBLIC_AUTH_ENABLED === "true" ||
  //     process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" ||
  //     process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true" ||
  //     process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true"
  //   ) && !!(process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false")
  // );



  // 如果配置了 Supabase，就启用认证
  // 除非明确设置 NEXT_PUBLIC_AUTH_ENABLED=false
  // if (process.env.NEXT_PUBLIC_AUTH_ENABLED === "false") {
  //   return false;
  // }

  // 只要有 Supabase 配置就启用
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isGoogleAuthEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
  );
}

export function isGitHubAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";
}

export function isGoogleOneTapEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ONE_TAP_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID
  );
}
