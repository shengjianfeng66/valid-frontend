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
    const resultMessages = (await import(`./pages/result/${locale.toLowerCase()}.json`))
      .default;

    // 深度合并函数
    const deepMerge = (target: any, ...sources: any[]): any => {
      if (!sources.length) return target;
      const source = sources.shift();

      if (source === undefined) return target;

      if (typeof target === 'object' && typeof source === 'object') {
        for (const key in source) {
          if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
            if (!target[key]) Object.assign(target, { [key]: {} });
            deepMerge(target[key], source[key]);
          } else {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }

      return deepMerge(target, ...sources);
    };

    return {
      locale: locale,
      messages: deepMerge(
        {},
        messages,
        dashboardMessages,  // 包含 aiChat.formatIcons 等
        sidebarMessages,    // 包含 recentItems 等
        confirmDialogMessages,  // 全局对话框
        // 使用命名空间组织页面级翻译（避免 next、previous 等冲突）
        {
          goal: goalMessages,
          outline: outlineMessages,
          interview: interviewMessages,
          result: resultMessages,
        }
      ),
    };
  } catch (e) {
    return {
      locale: "en",
      messages: (await import(`./messages/en.json`)).default,
    };
  }
});
