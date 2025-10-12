import {
    PersonasResponse,
    InterviewDetail,
    InterviewResponsesData,
    StartInterviewParams,
    FinishInterviewParams,
    PersonaFromAPI
} from '@/types/interview';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * 获取推荐的人物画像
 */
export async function fetchRecommendedPersonas(count: number): Promise<PersonasResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/persona/recommend`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            persona_count: count
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`获取到 ${data.total_count} 个人物画像`);

    return data;
}

/**
 * 获取访谈详情
 */
export async function fetchInterviewDetail(interviewId: string): Promise<InterviewDetail> {
    const response = await fetch(`${API_BASE_URL}/api/v1/interview/get/${interviewId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📝 获取到访谈详情:', data);

    return data;
}

/**
 * 获取已访谈用户数据（分页）
 */
export async function fetchInterviewResponses(
    interviewId: number,
    page: number = 1,
    pageSize: number = 20
): Promise<InterviewResponsesData> {
    const url = `${API_BASE_URL}/api/v1/interview/get_responses_and_interviewees?interview_id=${interviewId}&page=${page}&page_size=${pageSize}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📝 获取已访谈用户数据:', data);

    return data;
}

/**
 * 获取模拟用户池
 */
export async function fetchSimulatedUserPool(): Promise<PersonaFromAPI[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/interviewee/list_simulated_users`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 转换数据格式 - 支持两种数据结构
    let personasArray: PersonaFromAPI[] = [];

    if (Array.isArray(data.personas)) {
        personasArray = data.personas;
    } else if (Array.isArray(data)) {
        personasArray = data;
    }

    return personasArray;
}

/**
 * 开始访谈
 */
export async function startInterview(params: StartInterviewParams): Promise<any> {
    console.log('开始访谈，参数:', params);

    const response = await fetch(`${API_BASE_URL}/api/v1/interview/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('访谈开始成功:', data);

    return data;
}

/**
 * 结束访谈
 */
export async function finishInterview(params: FinishInterviewParams): Promise<any> {
    console.log('结束访谈，参数:', params);

    const response = await fetch(`${API_BASE_URL}/api/v1/interview/finish`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('访谈结束成功:', data);

    return data;
}

