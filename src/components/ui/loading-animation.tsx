"use client";

import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/animations/loading.json';

interface LoadingAnimationProps {
    width?: number;
    height?: number;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
}

export function LoadingAnimation({
    width = 200,
    height = 200,
    loop = true,
    autoplay = true,
    className = ""
}: LoadingAnimationProps) {
    const lottieRef = useRef<any>(null);

    useEffect(() => {
        if (lottieRef.current && autoplay) {
            lottieRef.current.play();
        }
    }, [autoplay]);

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Lottie
                lottieRef={lottieRef}
                animationData={loadingAnimation}
                loop={loop}
                autoplay={autoplay}
                style={{
                    width: width,
                    height: height,
                }}
            />
        </div>
    );
}
