// 状态配置映射
export const RESPONSE_STATUS_CONFIG: Record<number, { label: string; color: string }> = {
    0: { label: "待开始", color: "text-yellow-600 bg-yellow-50" },
    1: { label: "进行中", color: "text-green-600 bg-green-50" },
    2: { label: "已暂停", color: "text-gray-600 bg-gray-50" },
    3: { label: "已完成", color: "text-blue-600 bg-blue-50" }
};