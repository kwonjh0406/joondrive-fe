"use client";

import { FileItem } from "@/hooks/use-drive";
import { FileItemComponent } from "./file-item";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortField, SortOrder } from "@/hooks/use-drive";

interface FileListProps {
    files: FileItem[];
    selectedItems: number[];
    onSelect: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onNavigate: (folder: FileItem) => void;
    sortField: SortField;
    sortOrder: SortOrder;
    onSort: (field: SortField) => void;
    onDragStart: (e: React.DragEvent, id: number, type: "file" | "folder") => void;
    onDragOver: (e: React.DragEvent, id: number | null) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, id: number | null) => void;
    dragOverFolderId: number | null;
}

export function FileList({
    files,
    selectedItems,
    onSelect,
    onSelectAll,
    onNavigate,
    sortField,
    sortOrder,
    onSort,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    dragOverFolderId,
}: FileListProps) {
    const allSelected =
        files.length > 0 && selectedItems.length === files.length;

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortOrder === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4 text-foreground" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4 text-foreground" />
        );
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="w-10 flex justify-center">
                    <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                    />
                </div>
                <div
                    className="flex-1 flex items-center cursor-pointer hover:text-foreground group"
                    onClick={() => onSort("name")}
                >
                    이름 <SortIcon field="name" />
                </div>
                <div
                    className="w-32 hidden md:flex items-center cursor-pointer hover:text-foreground group"
                    onClick={() => onSort("size")}
                >
                    크기 <SortIcon field="size" />
                </div>
                <div
                    className="w-48 hidden md:flex items-center cursor-pointer hover:text-foreground group"
                    onClick={() => onSort("modified")}
                >
                    수정 날짜 <SortIcon field="modified" />
                </div>
                <div className="w-10"></div>
            </div>
            <div className="flex-1">
                {files.map((file) => (
                    <FileItemComponent
                        key={file.id}
                        file={file}
                        viewMode="list"
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
                    <div className="py-12 text-center text-muted-foreground">
                        파일이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
