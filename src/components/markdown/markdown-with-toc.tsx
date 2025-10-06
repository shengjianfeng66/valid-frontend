"use client";

import { useState, useEffect, useMemo } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import "./markdown.css";

interface TocItem {
    level: number;
    title: string;
    id: string;
    index: number;
}

export default function MarkdownWithTOC({
    content,
    showToc = true
}: {
    content: string;
    showToc?: boolean;
}) {
    const [activeId, setActiveId] = useState<string>("");

    // 生成目录
    const toc = useMemo(() => {
        const headings = content.match(/^(#{1,6})\s(.+)/gm) || [];
        return headings.map((heading, index) => {
            const level = heading.match(/^#+/)?.[0].length || 1;
            const title = heading.replace(/^#+\s/, "");
            const id = `heading-${index}`;
            return { level, title, id, index };
        });
    }, [content]);

    // 为内容添加 id
    const contentWithIds = useMemo(() => {
        let index = 0;
        return content.replace(/^(#{1,6})\s(.+)/gm, (match, hashes, title) => {
            const id = `heading-${index}`;
            index++;
            return `${match} {#${id}}`;
        });
    }, [content]);

    // 监听滚动，更新活动标题
    useEffect(() => {
        const handleScroll = () => {
            const headingElements = toc.map(item =>
                document.getElementById(item.id)
            ).filter(Boolean);

            const scrollPosition = window.scrollY + 100;

            for (let i = headingElements.length - 1; i >= 0; i--) {
                const element = headingElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveId(toc[i].id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [toc]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // 为固定头部留出空间
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // 更新活动ID
            setActiveId(id);
        }
    };

    if (!showToc) {
        return (
            <div className="prose prose-slate dark:prose-invert max-w-none">
                <MDEditor.Markdown
                    className="markdown bg-background"
                    source={content}
                    components={{
                        a: ({ children, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer">
                                {children}
                            </a>
                        ),
                    }}
                />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 目录 - 左侧或顶部 */}
            <div className="lg:col-span-3 order-1 lg:order-1">
                <Card className="sticky top-20">
                    <CardHeader>
                        <CardTitle className="text-lg">目录</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-200px)] px-4 pb-4">
                            <nav className="space-y-1">
                                {toc.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollToHeading(item.id)}
                                        className={cn(
                                            "block w-full text-left text-sm transition-colors hover:text-primary py-1.5 px-2 rounded-md",
                                            activeId === item.id
                                                ? "text-primary bg-primary/10 font-medium"
                                                : "text-muted-foreground hover:bg-muted",
                                        )}
                                        style={{
                                            paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                                        }}
                                    >
                                        {item.title}
                                    </button>
                                ))}
                            </nav>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Markdown 内容 - 右侧或底部 */}
            <div className="lg:col-span-9 order-2 lg:order-2">
                <Card>
                    <CardContent className="p-6 md:p-8">
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <MDEditor.Markdown
                                className="markdown bg-background"
                                source={content}
                                components={{
                                    a: ({ children, ...props }) => (
                                        <a {...props} target="_blank" rel="noopener noreferrer">
                                            {children}
                                        </a>
                                    ),
                                    h1: ({ children, ...props }) => {
                                        const childText = typeof children === 'string' ? children : String(children);
                                        const index = toc.findIndex(item => item.title === childText);
                                        const id = index >= 0 ? toc[index].id : undefined;
                                        return <h1 id={id} {...props} className="scroll-mt-24">{children}</h1>;
                                    },
                                    h2: ({ children, ...props }) => {
                                        const childText = typeof children === 'string' ? children : String(children);
                                        const index = toc.findIndex(item => item.title === childText);
                                        const id = index >= 0 ? toc[index].id : undefined;
                                        return <h2 id={id} {...props} className="scroll-mt-24">{children}</h2>;
                                    },
                                    h3: ({ children, ...props }) => {
                                        const childText = typeof children === 'string' ? children : String(children);
                                        const index = toc.findIndex(item => item.title === childText);
                                        const id = index >= 0 ? toc[index].id : undefined;
                                        return <h3 id={id} {...props} className="scroll-mt-24">{children}</h3>;
                                    },
                                    h4: ({ children, ...props }) => {
                                        const childText = typeof children === 'string' ? children : String(children);
                                        const index = toc.findIndex(item => item.title === childText);
                                        const id = index >= 0 ? toc[index].id : undefined;
                                        return <h4 id={id} {...props} className="scroll-mt-24">{children}</h4>;
                                    },
                                    h5: ({ children, ...props }) => {
                                        const childText = typeof children === 'string' ? children : String(children);
                                        const index = toc.findIndex(item => item.title === childText);
                                        const id = index >= 0 ? toc[index].id : undefined;
                                        return <h5 id={id} {...props} className="scroll-mt-24">{children}</h5>;
                                    },
                                    h6: ({ children, ...props }) => {
                                        const childText = typeof children === 'string' ? children : String(children);
                                        const index = toc.findIndex(item => item.title === childText);
                                        const id = index >= 0 ? toc[index].id : undefined;
                                        return <h6 id={id} {...props} className="scroll-mt-24">{children}</h6>;
                                    },
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
