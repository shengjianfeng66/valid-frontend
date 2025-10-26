import { INTERVIEW_STATUS_CONFIG, INTERVIEWEE_STATUS_CONFIG } from "@/config";
import type { PersonaFromAPI } from "@/types/interview";
import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

// 获取状态配置（带默认值）
export const getStatusConfig = (state: number, isInterviewee?: boolean) => {
    return isInterviewee ? INTERVIEWEE_STATUS_CONFIG[state] : INTERVIEW_STATUS_CONFIG[state] || {
        label: "",
        color: "text-gray-600 bg-gray-50",
        containerClassName: "bg-gray-100 text-gray-700"
    };
};

/**
 * 将 API 返回的数据转换为组件需要的格式
 */
export function transformPersonaToUser(persona: PersonaFromAPI): any {
    const content = persona.content;
    const attributes: Record<string, string> = {};

    // 提取所有标签 - 添加 null 检查
    if (content && content.user_profile_tags) {
        Object.keys(content.user_profile_tags).forEach(categoryKey => {
            const category = content.user_profile_tags![categoryKey];

            // 遍历子分类
            if (category && category.subcategories) {
                Object.keys(category.subcategories).forEach(subKey => {
                    const subcategory = category.subcategories![subKey];

                    // 提取所有tags
                    if (subcategory && subcategory.tags) {
                        Object.keys(subcategory.tags).forEach(tagKey => {
                            attributes[tagKey] = subcategory.tags[tagKey];
                        });
                    }
                });
            }
        });
    }

    // 基于 persona.id 生成唯一头像
    const avatarSvg = createAvatar(notionists, {
        seed: `${persona.id}`,
    }).toDataUri();

    return {
        id: `api-${persona.id}`,
        name: persona.name || '未命名用户',
        avatar: avatarSvg,
        status: "等待中",
        isReal: false,
        attributes: attributes,
        rawContent: content,
        source: persona.source,
        created_at: persona.created_at
    };
}

/**
 * 从用户ID中提取数字ID
 */
export function extractNumericId(userId: string): number | null {
    const match = userId.match(/^api-(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
}

/**
 * 格式化日期为中文格式
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '.');
}

/**
 * 将时长（秒）格式化为“xx分钟”
 */
export function formatDurationMinutes(durationSeconds: number): string {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        return "0分钟";
    }
    const minutes = Math.round(durationSeconds / 60);
    return `${minutes}分钟`;
}