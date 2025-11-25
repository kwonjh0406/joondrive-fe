"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    HardDrive,
    Clock,
    Star,
    Trash2,
    Cloud,
    Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    usedStorage: number;
    totalStorage: number;
    onUploadClick: () => void;
    onCreateFolderClick: () => void;
}

export function Sidebar({
    usedStorage,
    totalStorage,
    onUploadClick,
    onCreateFolderClick,
}: SidebarProps) {
    const storagePercentage =
        totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;

    return (
        <div className="w-64 flex flex-col gap-6 p-4 hidden lg:flex bg-background">
            <div className="flex flex-col gap-2 px-2">
                <Button
                    className="w-fit h-14 rounded-[16px] px-6 shadow-md hover:shadow-lg transition-all bg-white text-primary hover:bg-gray-50 border border-transparent"
                    onClick={onUploadClick}
                >
                    <Plus className="w-6 h-6 mr-2" />
                    <span className="text-base font-medium">새로 만들기</span>
                </Button>
            </div>

            <nav className="flex flex-col gap-1 pr-4">
                <Button
                    variant="ghost"
                    className="justify-start gap-4 px-6 h-10 rounded-r-full bg-primary/10 text-primary font-medium"
                >
                    <HardDrive className="w-4 h-4" /> 내 드라이브
                </Button>
                <Button
                    variant="ghost"
                    className="justify-start gap-4 px-6 h-10 rounded-r-full text-muted-foreground hover:bg-gray-100"
                >
                    <Clock className="w-4 h-4" /> 최근 문서
                </Button>
                <Button
                    variant="ghost"
                    className="justify-start gap-4 px-6 h-10 rounded-r-full text-muted-foreground hover:bg-gray-100"
                >
                    <Star className="w-4 h-4" /> 중요 문서
                </Button>
                <Button
                    variant="ghost"
                    className="justify-start gap-4 px-6 h-10 rounded-r-full text-muted-foreground hover:bg-gray-100"
                >
                    <Trash2 className="w-4 h-4" /> 휴지통
                </Button>
            </nav>

            <div className="mt-auto px-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                    <Cloud className="w-4 h-4" /> 저장 용량
                </div>
                <Progress value={storagePercentage} className="h-1 mb-2 bg-gray-200" />
                <div className="text-xs text-muted-foreground">
                    {usedStorage.toFixed(2)} GB / {totalStorage} GB 사용 중
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full rounded-full text-primary border-gray-300 hover:bg-gray-50"
                >
                    저장용량 구매
                </Button>
            </div>
        </div>
    );
}
