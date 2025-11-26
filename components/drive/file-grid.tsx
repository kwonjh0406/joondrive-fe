"use client";

import { FileItem } from "@/types/drive";
import { FileItem as FileItemComponent } from "./file-item";

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
    draggedFileId: number | null;
    onDragEnd: () => void;
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
    draggedFileId,
    onDragEnd,
}: FileGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {files.map((file) => (
                <FileItemComponent
                    key={file.id}
                    file={file}
                    viewMode="grid"
                    selected={selectedItems.includes(file.id)}
                    onSelect={() => onSelect(file.id)}
                    onNavigate={onNavigate}
                    onDragStart={(e, f) => onDragStart(e, f.id, f.type)}
                    onDragOver={(e) => onDragOver(e, file.id)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDrop(e, file.id)}
                    dragOver={dragOverFolderId === file.id}
                    isDragging={draggedFileId === file.id}
                    onDragEnd={onDragEnd}
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
