import useSWR from "swr"
import { fetchRecommendedPersonas, fetchInterviewDetail, fetchInterviewResponses } from "@/services/interview"
import type { PersonasResponse, InterviewDetail, InterviewResponsesData } from "@/types/interview"

/** 使用 SWR 获取推荐人物画像 */
export function useRecommendedPersonas(count: number, shouldFetch: boolean = true) {
  return useSWR<PersonasResponse>(
    shouldFetch ? ["recommendedPersonas", count] : null,
    () => fetchRecommendedPersonas(count),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
}

/** 使用 SWR 获取访谈详情 */
export function useInterviewDetail(interviewId: string | null) {
  return useSWR<InterviewDetail>(
    interviewId ? ["interviewDetail", interviewId] : null,
    () => fetchInterviewDetail(interviewId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )
}

/** 使用 SWR 获取已访谈用户数据 */
export function useInterviewResponses(
  interviewId: number | null,
  page: number = 1,
  shouldFetch: boolean = true,
  refreshIntervalMs: number = 0,
) {
  return useSWR<InterviewResponsesData>(
    interviewId && shouldFetch ? ["interviewResponses", interviewId, page] : null,
    () => fetchInterviewResponses(interviewId!, page),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: shouldFetch && refreshIntervalMs > 0 ? refreshIntervalMs : 0,
      dedupingInterval: refreshIntervalMs > 0 ? Math.min(2000, refreshIntervalMs) : 2000,
      keepPreviousData: true,
    },
  )
}
