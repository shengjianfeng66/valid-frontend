import GoogleAnalytics from "./google-analytics";
import OpenPanelAnalytics from "./open-panel";
import Plausible from "./plausible";

// 默认导出：Analytics 组件
export default function Analytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <OpenPanelAnalytics />
      <GoogleAnalytics />
      <Plausible />
    </>
  );
}

// 命名导出：分析页面的 Tab 组件
export { ReportTab } from './report-tab';
export { OriginalVoiceTab } from './original-voice-tab';
export { InsightsTab } from './insights-tab';
