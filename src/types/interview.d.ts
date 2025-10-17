// 人物画像内容
export interface PersonaContent {
    meta?: any;
    user_profile_tags?: {
        [categoryKey: string]: {
            name: string;
            description?: string;
            subcategories?: {
                [subKey: string]: {
                    name: string;
                    tags: {
                        [tagKey: string]: string;
                    }
                }
            }
        }
    };
    [key: string]: any;
}

// API 返回的人物画像
export interface PersonaFromAPI {
    id: number;
    name: string;
    content: PersonaContent;
    source: number;
    created_at: string;
    updated_at: string | null;
}

// 人物画像列表响应
export interface PersonasResponse {
    personas: PersonaFromAPI[];
    total_count: number;
    requested_count: number;
}

// 访谈详情
export interface InterviewDetail {
    id: number;
    name: string;
    description?: string;
    state: number; // 0: 未开始, 1: 访谈中, 2: 暂停, 3: 已结束
    duration?: number;
    created_at: string;
    updated_at?: string;
    participants?: {
        recommended_total: number;
    };
}

// 访谈响应
export interface InterviewResponse {
    id: number;
    interview_id: number;
    interviewee_id: number;
    state: number;
    duration: number | null;
    details: any;
    created_at: string;
}

// 受访者
export interface Interviewee {
    id: number;
    name: string;
    content: PersonaContent;
    source: number;
}

// 访谈用户数据
export interface InterviewResponseWithInterviewee {
    response: InterviewResponse;
    interviewee: Interviewee;
}

// 已访谈用户列表响应
export interface InterviewResponsesData {
    success: boolean;
    items: InterviewResponseWithInterviewee[];
    page: number;
    page_size: number;
    total: number;
}

// 开始访谈参数
export interface StartInterviewParams {
    interview_id: number;
    interviewee_ids: number[];
}

// 结束访谈参数
export interface FinishInterviewParams {
    interview_id: number;
    user_id: number;
}

