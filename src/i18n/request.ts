import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  if (["zh-CN"].includes(locale)) {
    locale = "zh";
  }

  if (!routing.locales.includes(locale as any)) {
    locale = "en";
  }

  try {
    const messages = (await import(`./messages/${locale.toLowerCase()}.json`))
      .default;

    // 加载页面级翻译，使用命名空间避免冲突
    const goalMessages = (await import(`./pages/goal/${locale.toLowerCase()}.json`))
      .default;
    const outlineMessages = (await import(`./pages/outline/${locale.toLowerCase()}.json`))
      .default;
    const interviewMessages = (await import(`./pages/interview/${locale.toLowerCase()}.json`))
      .default;
    const sidebarMessages = (await import(`./pages/sidebar/${locale.toLowerCase()}.json`))
      .default;
    const confirmDialogMessages = (await import(`./pages/confirm-dialog/${locale.toLowerCase()}.json`))
      .default;
    const dashboardMessages = (await import(`./pages/dashboard/${locale.toLowerCase()}.json`))
      .default;

    return {
      locale: locale,
      messages: {
        ...messages,
        // 使用命名空间组织页面级翻译
        goal: goalMessages,
        outline: outlineMessages,
        interview: interviewMessages,
        sidebar: sidebarMessages,
        confirmDialog: confirmDialogMessages,
        dashboard: dashboardMessages,
      },
    };
  } catch (e) {
    return {
      locale: "en",
      messages: (await import(`./messages/en.json`)).default,
    };
  }
});
