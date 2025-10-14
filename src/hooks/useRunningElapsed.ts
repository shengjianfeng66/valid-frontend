import { useEffect, useState } from "react";

/**
 * 基于 created_at 实时计算经过时间，返回“X分Y秒”字符串。
 * @param createdAtIso ISO 时间字符串（例如：2025-10-12T15:27:44.333075+00:00）
 * @param enabled 是否启用计时（通常等于“进行中”状态）
 * @param tickMs 更新频率，默认 1000ms
 */
export function useRunningElapsed(
    createdAtIso: string | undefined,
    enabled: boolean,
    tickMs: number = 1000
): string {
    const [label, setLabel] = useState<string>("");

    useEffect(() => {
        if (!enabled || !createdAtIso) {
            setLabel("");
            return;
        }

        const createdTime = new Date(createdAtIso).getTime();
        if (!Number.isFinite(createdTime)) {
            setLabel("");
            return;
        }

        const update = () => {
            const now = Date.now();
            const diffSec = Math.max(0, Math.floor((now - createdTime) / 1000));
            const minutes = Math.floor(diffSec / 60);
            const seconds = diffSec % 60;
            setLabel(`${minutes}分${seconds}秒`);
        };

        update();
        const timer = window.setInterval(update, tickMs);
        return () => window.clearInterval(timer);
    }, [createdAtIso, enabled, tickMs]);

    return label;
}


