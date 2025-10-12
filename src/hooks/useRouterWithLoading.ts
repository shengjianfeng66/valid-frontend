"use client";

import { useRouter as useNextRouter } from "@/i18n/navigation";
import NProgress from "nprogress";
import { useCallback } from "react";

export function useRouterWithLoading() {
    const router = useNextRouter();

    const push = useCallback((href: string, options?: any) => {
        NProgress.start();
        router.push(href, options);
    }, [router]);

    const replace = useCallback((href: string, options?: any) => {
        NProgress.start();
        router.replace(href, options);
    }, [router]);

    const back = useCallback(() => {
        NProgress.start();
        router.back();
    }, [router]);

    return { ...router, push, replace, back };
}

