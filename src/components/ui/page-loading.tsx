import { LoadingAnimation } from "@/components/ui/loading-animation";

export function PageLoading() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="flex flex-col items-center gap-4">
                <LoadingAnimation width={150} height={150} />
            </div>
        </div>
    );
}

