import { RESPONSE_STATUS_CONFIG } from "@/config";

// 获取状态配置（带默认值）
export const getStatusConfig = (state: number) => {
    return RESPONSE_STATUS_CONFIG[state] || { label: "", color: "text-gray-600 bg-gray-50" };
};

// 根据状态标签获取颜色样式
export const getStatusColorByLabel = (statusLabel: string) => {
    const config = Object.values(RESPONSE_STATUS_CONFIG).find(c => c.label === statusLabel);
    return config?.color || "text-gray-600 bg-gray-50";
};