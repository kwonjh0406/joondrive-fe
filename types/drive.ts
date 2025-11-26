export type ViewMode = "list" | "grid";
export type SortField = "name" | "modified" | "size";
export type SortOrder = "asc" | "desc";

export interface FileItem {
    id: number;
    name: string;
    type: "file" | "folder";
    size?: string;
    modified: string;
    parentId: number | null;
    mimeType?: string;
}

export interface DriveState {
    currentParentId: number | null;
    breadcrumbPath: { id: number | null; name: string }[];
    files: FileItem[];
    selectedItems: number[];
    viewMode: ViewMode;
    sortField: SortField;
    sortOrder: SortOrder;
}
