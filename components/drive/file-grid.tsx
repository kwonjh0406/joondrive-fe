"use client";

import { FileItem } from "@/hooks/use-drive";
import { FileItemComponent } from "./file-item";

interface FileGridProps {
    files: FileItem[];
    selectedItems: number[];
    onSelect: (id: number) => void;
    onNavigate: (folder: FileItem) => void;
    onDragStart: (e: React.DragEvent, id: number, type: "file" | "folder") => void;
    onDragOver: (e: React.DragEvent, id: number | null) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, id: number | null) => void;
    dragOverFolderId: number | null;
}

export function FileGrid({
    files,
    selectedItems,
    onSelect,
    onNavigate,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    dragOverFolderId,
}: FileGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {files.map((file) => (
                <FileItemComponent
                    key={file.id}
                    file={file}
                    viewMode="grid"
                    isSelected={selectedItems.includes(file.id)}
                    onSelect={onSelect}
                    onNavigate={onNavigate}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    dragOverFolderId={dragOverFolderId}
                />
            ))}
            {files.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                    파일이 없습니다.
                </div>
            )}
        </div>
    );
}
