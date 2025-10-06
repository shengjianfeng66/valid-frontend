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

    // 加载页面级翻译并合并到全局消息中
    const goalMessages = (await import(`./pages/goal/${locale.toLowerCase()}.json`))
      .default;
    const outlineMessages = (await import(`./pages/outline/${locale.toLowerCase()}.json`))
      .default;
    const interviewMessages = (await import(`./pages/interview/${locale.toLowerCase()}.json`))
      .default;

    return {
      locale: locale,
      messages: {
        ...messages,
        ...goalMessages,
        ...outlineMessages,
        ...interviewMessages,
      },
    };
  } catch (e) {
    return {
      locale: "en",
      messages: (await import(`./messages/en.json`)).default,
    };
  }
});
