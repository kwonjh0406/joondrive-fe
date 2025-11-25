"use client";

import { FileItem } from "@/hooks/use-drive";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    File,
    Folder,
    MoreVertical,
    Download,
    Trash2,
    Edit,
    Move,
} from "lucide-react";
import { ThumbnailImage } from "./thumbnail";
import { cn } from "@/lib/utils";

interface FileItemProps {
    file: FileItem;
    viewMode: "list" | "grid";
    isSelected: boolean;
    onSelect: (id: number) => void;
    onNavigate: (folder: FileItem) => void;
    onDragStart: (e: React.DragEvent, id: number, type: "file" | "folder") => void;
    onDragOver: (e: React.DragEvent, id: number | null) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, id: number | null) => void;
    dragOverFolderId: number | null;
}

export function FileItemComponent({
    file,
    viewMode,
    isSelected,
    onSelect,
    onNavigate,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    dragOverFolderId,
}: FileItemProps) {
    const isFolder = file.type === "folder";
    const isDragOver = dragOverFolderId === file.id;

    const handleDragStart = (e: React.DragEvent) => {
        onDragStart(e, file.id, file.type);
    };

    const handleDragOver = (e: React.DragEvent) => {
        if (isFolder) {
            onDragOver(e, file.id);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        if (isFolder) {
            onDrop(e, file.id);
        }
    };

    if (viewMode === "list") {
        return (
            <div
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={onDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex items-center px-4 py-3 border-b last:border-0 transition-colors group cursor-pointer",
                    isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50",
                    isDragOver && "bg-blue-100 ring-2 ring-primary z-10"
                )}
                onClick={() => isFolder ? onNavigate(file) : onSelect(file.id)}
            >
                <div className="w-10 flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(file.id)}
                        className={cn(
                            "transition-opacity",
                            !isSelected && "opacity-0 group-hover:opacity-100"
                        )}
                    />
                </div>
                <div className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="w-8 h-8 flex items-center justify-center">
                        {isFolder ? (
                            <Folder className="w-6 h-6 fill-current text-gray-500" />
                        ) : file.mimeType?.startsWith("image/") ? (
                            <div className="w-8 h-8 rounded overflow-hidden bg-muted border">
                                <ThumbnailImage file={file} />
                            </div>
                        ) : (
                            <File className="w-6 h-6 text-blue-500" />
                        )}
                    </div>
                    <span className="truncate font-medium text-sm text-foreground/90">{file.name}</span>
                </div>
                <div className="w-32 text-sm text-muted-foreground hidden md:block">
                    {file.size || "-"}
                </div>
                <div className="w-48 text-sm text-muted-foreground hidden md:block">
                    {new Date(file.modified).toLocaleDateString()}
                </div>
                <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </div>
            </div>
        );
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={onDragLeave}
            onDrop={handleDrop}
            className={cn(
                "group relative flex flex-col gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer",
                isSelected && "bg-blue-50 border-blue-200 ring-1 ring-blue-200",
                isDragOver && "bg-blue-100 ring-2 ring-primary scale-105 z-10"
            )}
            onClick={() => isFolder ? onNavigate(file) : onSelect(file.id)}
        >
            <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(file.id)}
                    className={cn(
                        "transition-opacity",
                        !isSelected && "opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
                    )}
                />
            </div>
            <div className="aspect-[4/3] rounded-lg bg-muted/30 overflow-hidden flex items-center justify-center border border-border/50">
                {isFolder ? (
                    <Folder className="w-16 h-16 text-gray-400 fill-current" />
                ) : file.mimeType?.startsWith("image/") ? (
                    <ThumbnailImage file={file} />
                ) : (
                    <File className="w-12 h-12 text-blue-500" />
                )}
            </div>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-foreground/90">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        {isFolder ? (
                            <div className="flex items-center gap-1">
                                <Folder className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">폴더</span>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">{file.size}</span>
                        )}
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 -mr-2">
                    <MoreVertical className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}
