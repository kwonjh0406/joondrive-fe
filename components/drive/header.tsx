"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    LayoutGrid,
    List as ListIcon,
    ChevronRight,
    Home,
    Download,
    Trash2,
    Settings,
    HelpCircle,
} from "lucide-react";
import { ViewMode } from "@/types/drive";

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    breadcrumbPath: { id: number | null; name: string }[];
    onBreadcrumbClick: (id: number | null, index: number) => void;
    selectedCount: number;
    onDelete: () => void;
    onDownload: () => void;
}

export function Header({
    searchQuery,
    onSearchChange,
    viewMode,
    onViewModeChange,
    breadcrumbPath,
    onBreadcrumbClick,
    selectedCount,
    onDelete,
    onDownload,
}: HeaderProps) {
    return (
        <div className="flex flex-col gap-4 pb-2">
            <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex-1 max-w-3xl">
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="드라이브에서 검색"
                            className="pl-11 h-11 rounded-full bg-muted/50 border-transparent focus-visible:bg-background focus-visible:shadow-md focus-visible:ring-0 transition-all"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {selectedCount > 0 ? (
                        <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-full animate-fade-in">
                            <span className="text-sm font-medium px-2">{selectedCount}개 선택됨</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onDownload}
                                className="h-8 w-8 rounded-full hover:bg-background"
                                title="다운로드"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onDelete}
                                className="h-8 w-8 rounded-full hover:bg-background text-destructive"
                                title="삭제"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <Settings className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between px-2">

                <div className="flex items-center border rounded-full bg-background p-0.5 shadow-sm">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => onViewModeChange("list")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => onViewModeChange("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
