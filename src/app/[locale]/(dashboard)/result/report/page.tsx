"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import LocaleToggle from "@/components/locale/toggle"
import SignToggle from "@/components/sign/toggle"
import ThemeToggle from "@/components/theme/toggle"
import { useTranslations } from "next-intl"
import MarkdownWithTOC from "@/components/markdown/markdown-with-toc"
import { markdownTestContent } from "./data";

export default function ResultReportPage() {
    const t = useTranslations("result");

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {/* Header */}
                <header className="flex h-14 shrink-0 items-center gap-2 border-b">
                    <div className="flex flex-1 items-center gap-2 px-3">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">
                                        {t("breadcrumb.home")}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{t("breadcrumb.report")}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                        <LocaleToggle />
                        <ThemeToggle />
                        <SignToggle />
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">
                    {/* Markdown 文档渲染 */}
                    <MarkdownWithTOC content={markdownTestContent} showToc={true} />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
