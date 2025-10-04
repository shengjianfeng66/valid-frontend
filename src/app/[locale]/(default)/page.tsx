import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 重定向到dashboard页面
  redirect(`/${locale}/dashboard`);
}
