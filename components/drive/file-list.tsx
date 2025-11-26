"use client";

import React from "react";
import {
    Loader2,
    Inbox,
    Upload,
    FolderPlus,
    ArrowUp,
    ArrowDown,
    Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FileItem as FileItemType, ViewMode, SortField, SortOrder } from "@/types/drive";
import { FileItem } from "./file-item";
import { checkboxStyles, dragOverStyles, fileRowStyles } from "./file-utils";

interface FileListProps {
    files: FileItemType[];
    viewMode: ViewMode;
    isLoading: boolean;
    selectedItems: number[];
    sortField: SortField;
    sortOrder: SortOrder;
    parentFolder: FileItemType | null;
    dragOverFolderId: number | null;
    draggedFileId: number | null;
    isDragging: boolean;
    onSelectAll: (checked: boolean) => void;
    onSort: (field: SortField) => void;
    onNavigate: (folder: FileItemType) => void;
    onNavigateParent: () => void;
    onSelect: (id: number) => void;
    onUpload: () => void;
    onCreateFolder: () => void;
    // Drag handlers
    onDragStart: (e: React.DragEvent, file: FileItemType) => void;
    onDragEnd: () => void;
    onFolderDragOver: (e: React.DragEvent, folderId: number | null) => void;
    onFolderDragLeave: () => void;
    onFolderDrop: (e: React.DragEvent, folderId: number | null) => void;
}

export function FileList({
    files,
    viewMode,
    isLoading,
    selectedItems,
    sortField,
    sortOrder,
    parentFolder,
    dragOverFolderId,
    draggedFileId,
    isDragging,
    onSelectAll,
    onSort,
    onNavigate,
    onNavigateParent,
    onSelect,
    onUpload,
    onCreateFolder,
    onDragStart,
    onDragEnd,
    onFolderDragOver,
    onFolderDragLeave,
    onFolderDrop,
}: FileListProps) {
    const getDragOverClassName = (folderId: number | null, isMobile: boolean = false) => {
        if (dragOverFolderId === folderId) {
            return isMobile ? dragOverStyles.mobile : dragOverStyles.desktop;
        }
        return "";
    };

    if (viewMode === "list") {
        return (
            <>
                {/* Mobile Select All Header */}
                <div className="md:hidden px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={files.length > 0 && selectedItems.length === files.length}
                            onCheckedChange={(checked) => onSelectAll(!!checked)}
                            disabled={files.length === 0}
                            className={checkboxStyles}
                        />
                        <span className="text-sm text-foreground">전체 선택</span>
                    </div>
                    {selectedItems.length > 0 && (
                        <span className="text-xs font-medium text-muted-foreground">
                            {selectedItems.length}개 선택됨
                        </span>
                    )}
                </div>

                {/* Desktop Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-medium text-foreground/70 items-center">
                    <div className="col-span-1 flex items-center justify-start pl-4">
                        <Checkbox
                            checked={files.length > 0 && selectedItems.length === files.length}
                            onCheckedChange={(checked) => onSelectAll(!!checked)}
                            disabled={files.length === 0}
                            className={checkboxStyles}
                            title="전체 선택"
                        />
                    </div>
                    <button
                        onClick={() => onSort("name")}
                        className={`col-span-6 flex items-center gap-1.5 transition-colors text-left ${sortField === "name"
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        이름
                        {sortField === "name" &&
                            (sortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-primary" />
                            ) : (
                                <ArrowDown className="h-4 w-4 text-primary" />
                            ))}
                    </button>
                    <button
                        onClick={() => onSort("modified")}
                        className={`col-span-4 flex items-center gap-1.5 transition-colors text-left ${sortField === "modified"
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        수정일
                        {sortField === "modified" &&
                            (sortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-primary" />
                            ) : (
                                <ArrowDown className="h-4 w-4 text-primary" />
                            ))}
                    </button>
                    <button
                        onClick={() => onSort("size")}
                        className={`col-span-1 flex items-center justify-end gap-1.5 transition-colors text-right ${sortField === "size"
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        크기
                        {sortField === "size" &&
                            (sortOrder === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-primary" />
                            ) : (
                                <ArrowDown className="h-4 w-4 text-primary" />
                            ))}
                    </button>
                </div>

                <div className="divide-y divide-border">
                    {parentFolder && (
                        <div
                            className={`${fileRowStyles} cursor-pointer hover:bg-muted/30`}
                            onClick={onNavigateParent}
                            onDragOver={(e) => onFolderDragOver(e, parentFolder.id)}
                            onDragLeave={onFolderDragLeave}
                            onDrop={(e) => onFolderDrop(e, parentFolder.id)}
                        >
                            <div className="md:hidden flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5" />
                                <div className="flex-1 min-w-0">
                                    <div
                                        className={`flex items-center gap-2 w-full text-left transition-all ${getDragOverClassName(
                                            parentFolder.id,
                                            true
                                        )}`}
                                    >
                                        <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                        <span className="font-normal text-foreground">
                                            ../{parentFolder.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                                <div className="col-span-1 flex items-center justify-center">
                                    <div className="w-5 h-5" />
                                </div>
                                <div className="col-span-6 flex items-center gap-3 min-w-0">
                                    <div
                                        className={`flex items-center gap-3 min-w-0 flex-1 text-left transition-all ${getDragOverClassName(
                                            parentFolder.id,
                                            false
                                        )}`}
                                    >
                                        <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                        <span className="font-normal text-foreground truncate leading-normal">
                                            ../{parentFolder.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-4 text-sm text-muted-foreground">-</div>
                                <div className="col-span-1 text-sm text-muted-foreground text-right">
                                    -
                                </div>
                            </div>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="px-6 py-12 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="px-6 py-16 md:py-20 flex flex-col items-center justify-center text-center">
                            <div className="mb-6 p-6 rounded-full bg-muted/50">
                                <Inbox className="h-16 w-16 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                파일이 없습니다
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-md">
                                파일을 업로드하거나 새 폴더를 만들어 시작해보세요
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button onClick={onUpload} disabled={isDragging} className="gap-2">
                                    {isDragging ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="h-4 w-4" />
                                    )}
                                    <span>파일 업로드</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={onCreateFolder}
                                    className="gap-2"
                                >
                                    <FolderPlus className="h-4 w-4" />
                                    <span>새 폴더</span>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        files.map((file, index) => (
                            <FileItem
                                key={file.id}
                                file={file}
                                viewMode="list"
                                selected={selectedItems.includes(file.id)}
                                isDragging={draggedFileId === file.id}
                                dragOver={dragOverFolderId === file.id}
                                onSelect={() => onSelect(file.id)}
                                onNavigate={onNavigate}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onDragOver={
                                    file.type === "folder"
                                        ? (e) => onFolderDragOver(e, file.id)
                                        : undefined
                                }
                                onDragLeave={
                                    file.type === "folder" ? onFolderDragLeave : undefined
                                }
                                onDrop={
                                    file.type === "folder"
                                        ? (e) => onFolderDrop(e, file.id)
                                        : undefined
                                }
                            />
                        ))
                    )}
                </div>
            </>
        );
    }

    // Grid View
    return (
        <div>
            {/* Mobile Header */}
            <div className="md:hidden px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={files.length > 0 && selectedItems.length === files.length}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                        disabled={files.length === 0}
                        className={checkboxStyles}
                    />
                    <span className="text-sm text-foreground">전체 선택</span>
                </div>
                {selectedItems.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {selectedItems.length}개 선택됨
                    </span>
                )}
            </div>

            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-medium text-foreground/70 items-center">
                <div className="col-span-1 flex items-center justify-center">
                    <Checkbox
                        checked={files.length > 0 && selectedItems.length === files.length}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                        disabled={files.length === 0}
                        className={checkboxStyles}
                        title="전체 선택"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="py-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : files.length === 0 && !parentFolder ? (
                <div className="py-16 md:py-20 flex flex-col items-center justify-center text-center">
                    <div className="mb-6 p-6 rounded-full bg-muted/50">
                        <Inbox className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        파일이 없습니다
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        파일을 업로드하거나 새 폴더를 만들어 시작해보세요
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={onUpload} disabled={isDragging} className="gap-2">
                            {isDragging ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4" />
                            )}
                            <span>파일 업로드</span>
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onCreateFolder}
                            className="gap-2"
                        >
                            <FolderPlus className="h-4 w-4" />
                            <span>새 폴더</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4 md:p-6">
                    {parentFolder && (
                        <div
                            className={`group relative flex flex-col items-center p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer ${dragOverFolderId === parentFolder.id
                                ? "ring-2 ring-primary bg-primary/10"
                                : ""
                                }`}
                            onDragOver={(e) => onFolderDragOver(e, parentFolder.id)}
                            onDragLeave={onFolderDragLeave}
                            onDrop={(e) => onFolderDrop(e, parentFolder.id)}
                            onClick={onNavigateParent}
                        >
                            <div className="relative w-full aspect-square mb-3 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                                <Folder className="h-12 w-12 text-yellow-500" />
                            </div>
                            <div className="w-full text-center">
                                <p
                                    className="text-xs font-normal text-foreground break-words"
                                    title={`../${parentFolder.name}`}
                                >
                                    ../{parentFolder.name}
                                </p>
                            </div>
                        </div>
                    )}
                    {files.map((file) => (
                        <FileItem
                            key={file.id}
                            file={file}
                            viewMode="grid"
                            selected={selectedItems.includes(file.id)}
                            isDragging={draggedFileId === file.id}
                            dragOver={dragOverFolderId === file.id}
                            onSelect={() => onSelect(file.id)}
                            onNavigate={onNavigate}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragOver={
                                file.type === "folder"
                                    ? (e) => onFolderDragOver(e, file.id)
                                    : undefined
                            }
                            onDragLeave={
                                file.type === "folder" ? onFolderDragLeave : undefined
                            }
                            onDrop={
                                file.type === "folder"
                                    ? (e) => onFolderDrop(e, file.id)
                                    : undefined
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
