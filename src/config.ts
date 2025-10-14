// 状态配置映射
export const INTERVIEW_STATUS_CONFIG: Record<number, {
    label: string;
    color: string;
    containerClassName: string;
}> = {
    0: {
        label: "待开始",
        color: "text-yellow-600 bg-yellow-50",
        containerClassName: "bg-gray-100 text-gray-700"
    },
    1: {
        label: "进行中",
        color: "text-green-600 bg-green-50",
        containerClassName: "bg-green-100 text-green-700"
    },
    2: {
        label: "已暂停",
        color: "text-gray-600 bg-gray-50",
        containerClassName: "bg-yellow-100 text-yellow-700"
    },
    3: {
        label: "已完成",
        color: "text-blue-600 bg-blue-50",
        containerClassName: "bg-blue-100 text-blue-700"
    }
};

export const INTERVIEWEE_STATUS_CONFIG: Record<number, {
    label: string;
    color: string;
    containerClassName: string;
}> = {
    ...INTERVIEW_STATUS_CONFIG,
    2: {
        label: "已完成",
        color: "text-blue-600 bg-blue-50",
        containerClassName: "bg-blue-100 text-blue-700"
    }
};
