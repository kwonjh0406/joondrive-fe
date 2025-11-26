"use client";

import React from "react";
import { File, Folder } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FileItem as FileItemType, ViewMode } from "@/types/drive";
import {
    getFileIconColor,
    isImageFile,
    dragOverStyles,
    checkboxStyles,
    fileRowStyles,
} from "./file-utils";
import { ThumbnailImage } from "./thumbnail-image";

interface FileItemProps {
    file: FileItemType;
    viewMode: ViewMode;
    selected: boolean;
    isDragging: boolean;
    dragOver: boolean;
    onSelect: () => void;
    onNavigate: (folder: FileItemType) => void;
    onDragStart: (e: React.DragEvent, file: FileItemType) => void;
    onDragEnd: () => void;
    onDragOver?: (e: React.DragEvent) => void;
    onDragLeave?: () => void;
    onDrop?: (e: React.DragEvent) => void;
}

export function FileItem({
    file,
    viewMode,
    selected,
    isDragging,
    dragOver,
    onSelect,
    onNavigate,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: FileItemProps) {
    const getDragOverClassName = (isMobile: boolean = false) => {
        if (dragOver) {
            return isMobile ? dragOverStyles.mobile : dragOverStyles.desktop;
        }
        return "";
    };

    const commonDragProps = {
        draggable: true,
        onDragStart: (e: React.DragEvent) => onDragStart(e, file),
        onDragEnd: onDragEnd,
        onDragOver: onDragOver,
        onDragLeave: onDragLeave,
        onDrop: onDrop,
    };

    if (viewMode === "grid") {
        return (
            <div
                {...commonDragProps}
                className={`group relative flex flex-col items-center p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer ${selected ? "ring-2 ring-primary bg-primary/5" : ""
                    } ${dragOver ? "ring-2 ring-primary bg-primary/10" : ""} ${isDragging ? "opacity-50" : ""
                    }`}
                onClick={onSelect}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (file.type === "folder") {
                        onNavigate(file);
                    }
                }}
            >
                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity data-[checked=true]:opacity-100" data-checked={selected}>
                    <Checkbox
                        checked={selected}
                        onCheckedChange={onSelect}
                        onClick={(e) => e.stopPropagation()}
                        className={checkboxStyles}
                    />
                </div>
                <div className="relative w-full aspect-square mb-3 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                    {file.type === "folder" ? (
                        <Folder className="h-12 w-12 text-yellow-500" />
                    ) : isImageFile(file) ? (
                        <ThumbnailImage file={file} />
                    ) : (
                        <File className={`h-12 w-12 ${getFileIconColor(file)}`} />
                    )}
                </div>
                <div className="w-full text-center">
                    <p className="text-xs font-medium text-foreground truncate mb-1" title={file.name}>
                        {file.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {file.type === "folder" ? file.modified : file.size}
                    </p>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div
            {...commonDragProps}
            onClick={onSelect}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (file.type === "folder") {
                    onNavigate(file);
                }
            }}
            className={`${fileRowStyles} cursor-pointer ${selected ? "bg-primary/10" : "hover:bg-muted/30"
                } ${isDragging ? "opacity-50" : ""}`}
        >
            <div className="md:hidden flex items-center gap-3">
                <div className="flex-shrink-0 flex items-center">
                    <Checkbox
                        checked={selected}
                        onCheckedChange={onSelect}
                        onClick={(e) => e.stopPropagation()}
                        className={checkboxStyles}
                    />
                </div>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <div
                        className={`flex items-center gap-2 flex-1 min-w-0 text-left transition-all ${file.type === "folder" ? getDragOverClassName(true) : ""
                            }`}
                    >
                        {file.type === "folder" ? (
                            <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        ) : (
                            <File className={`h-5 w-5 ${getFileIconColor(file)} flex-shrink-0`} />
                        )}
                        <span
                            className={`font-normal truncate leading-normal ${file.type === "folder"
                                ? "text-primary cursor-pointer hover:underline"
                                : "text-foreground"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                    onNavigate(file);
                                } else {
                                    onSelect();
                                }
                            }}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                    onNavigate(file);
                                }
                            }}
                        >
                            {file.name}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 text-[11px] text-muted-foreground flex-shrink-0">
                    <span>{file.modified}</span>
                    {file.type === "file" && file.size && <span>{file.size}</span>}
                </div>
            </div>

            <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                <div className="col-span-1 flex items-center justify-start pl-4">
                    <Checkbox
                        checked={selected}
                        onCheckedChange={onSelect}
                        onClick={(e) => e.stopPropagation()}
                        className={checkboxStyles}
                    />
                </div>
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                    <div
                        className={`flex items-center gap-3 min-w-0 flex-1 text-left transition-all ${file.type === "folder" ? getDragOverClassName(false) : ""
                            }`}
                    >
                        {file.type === "folder" ? (
                            <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        ) : (
                            <File className={`h-5 w-5 ${getFileIconColor(file)} flex-shrink-0`} />
                        )}
                        <span
                            className={`font-normal truncate leading-normal ${file.type === "folder"
                                ? "text-primary cursor-pointer hover:underline hover:text-primary"
                                : "text-foreground"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                    onNavigate(file);
                                } else {
                                    onSelect();
                                }
                            }}
                            onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                    onNavigate(file);
                                }
                            }}
                        >
                            {file.name}
                        </span>
                    </div>
                </div>
                <div className="col-span-4 text-sm text-muted-foreground">
                    {file.modified}
                </div>
                <div className="col-span-1 text-sm text-muted-foreground text-right">
                    {file.type === "file" ? file.size || "-" : "-"}
                </div>
            </div>
        </div>
    );
}
