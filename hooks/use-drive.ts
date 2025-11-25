"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

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

interface UseDriveProps {
  initialParentId?: number | null;
}

export function useDrive({ initialParentId = null }: UseDriveProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentParentId, setCurrentParentId] = useState<number | null>(
    initialParentId
  );
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    { id: number | null; name: string }[]
  >([{ id: null, name: "내 드라이브" }]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [parentFolder, setParentFolder] = useState<FileItem | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [totalStorage, setTotalStorage] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [draggedFileId, setDraggedFileId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const dragCounterRef = useRef<number>(0);

  const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/files`;
  const DRIVE_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/drive`;

  const fetchDriveInfo = async () => {
    try {
      const url = `${DRIVE_BASE}/me`;
      const res = await fetch(url, { method: "GET", credentials: "include" });

      if (!res.ok) {
        throw new Error(`drive info status ${res.status}`);
      }

      const response = await res.json();

      if (response.success && response.data) {
        const { email, usedStorage: usedBytes, storageLimit } = response.data;

        setUserEmail(email || "");
        const usedStorageGB = usedBytes ? usedBytes / (1024 * 1024 * 1024) : 0;
        setUsedStorage(usedStorageGB);
        setTotalStorage(storageLimit || 0);
      }
    } catch (e) {
      console.error("fetchDriveInfo error:", e);
      toast.error("드라이브 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);

    const formattedSize =
      size < 1
        ? size.toFixed(2)
        : size >= 100
        ? Math.round(size).toString()
        : size.toFixed(1);

    return `${formattedSize} ${sizes[i]}`;
  };

  const fetchFiles = async (parentId: number | null) => {
    setIsLoadingFiles(true);
    try {
      let url = BASE;
      if (parentId != null)
        url += `?parentId=${encodeURIComponent(String(parentId))}`;

      const res = await fetch(url, { method: "GET", credentials: "include" });
      const raw = await res.json();

      interface ApiFileResponse {
        id: number | string;
        name?: string;
        fileType?: string;
        size?: number;
        modified?: string;
        modifiedAt?: string;
        parentId?: number | string | null;
        mimeType?: string;
        contentType?: string;
      }

      let data: ApiFileResponse[] = Array.isArray(raw)
        ? raw
        : raw?.data ?? raw?.items ?? raw?.files ?? null;
      if (!Array.isArray(data)) {
        const maybe = Object.values(raw || {}).find((v) => Array.isArray(v));
        data = Array.isArray(maybe) ? (maybe as ApiFileResponse[]) : [];
      }

      const mapped: FileItem[] = data.map((f: ApiFileResponse) => ({
        id: Number(f.id),
        name: f.name ?? "Unknown",
        type: f.fileType === "folder" ? "folder" : "file",
        size: f.size != null ? formatFileSize(Number(f.size)) : undefined,
        modified: f.modified ?? f.modifiedAt ?? "",
        parentId: f.parentId != null ? Number(f.parentId) : null,
        mimeType: f.mimeType ?? f.contentType ?? undefined,
      }));

      setFiles(mapped);
    } catch (e) {
      console.error("fetchFiles error:", e);
      toast.error("파일을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (breadcrumbPath.length > 1) {
      const parentCrumb = breadcrumbPath[breadcrumbPath.length - 2];

      if (parentCrumb.id === null) {
        setParentFolder({
          id: -1,
          name: "내 드라이브",
          type: "folder",
          size: undefined,
          modified: "",
          parentId: null,
          mimeType: undefined,
        });
      } else {
        const parentFile = files.find(
          (f) => f.id === parentCrumb.id && f.type === "folder"
        );

        if (parentFile) {
          setParentFolder({
            id: parentFile.id,
            name: parentFile.name,
            type: "folder",
            size: undefined,
            modified: parentFile.modified,
            parentId: parentFile.parentId,
            mimeType: undefined,
          });
        } else {
          setParentFolder({
            id: parentCrumb.id,
            name: parentCrumb.name,
            type: "folder",
            size: undefined,
            modified: "",
            parentId:
              breadcrumbPath.length > 2
                ? breadcrumbPath[breadcrumbPath.length - 3]?.id ?? null
                : null,
            mimeType: undefined,
          });
        }
      }
    } else {
      setParentFolder(null);
    }
  }, [files, breadcrumbPath]);

  useEffect(() => {
    fetchDriveInfo();
    fetchFiles(currentParentId);
  }, [currentParentId]);

  const parseSize = (sizeStr?: string): number => {
    if (!sizeStr) return 0;
    const match = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/i);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers: { [key: string]: number } = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };
    return value * (multipliers[unit] || 1);
  };

  const sortFiles = (filesToSort: FileItem[]): FileItem[] => {
    const sorted = [...filesToSort].sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name, "ko", { numeric: true });
      } else if (sortField === "modified") {
        const dateA = new Date(a.modified).getTime();
        const dateB = new Date(b.modified).getTime();
        comparison = dateA - dateB;
      } else if (sortField === "size") {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        if (a.type === "folder" && b.type === "folder") {
          comparison = a.name.localeCompare(b.name, "ko", { numeric: true });
        } else {
          const sizeA = parseSize(a.size);
          const sizeB = parseSize(b.size);
          comparison = sizeA - sizeB;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentFiles = sortFiles(filteredFiles);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = (checked?: boolean | "indeterminate") => {
    if (checked === undefined || checked === "indeterminate") {
      if (selectedItems.length === currentFiles.length) setSelectedItems([]);
      else setSelectedItems(currentFiles.map((file) => file.id));
    } else {
      if (checked) {
        setSelectedItems(currentFiles.map((file) => file.id));
      } else {
        setSelectedItems([]);
      }
    }
  };

  const uploadFiles = async (filesToUpload: FileList | File[]) => {
    if (!filesToUpload || filesToUpload.length === 0) return;

    const formData = new FormData();
    Array.from(filesToUpload).forEach((file) => formData.append("files", file));
    if (currentParentId != null)
      formData.append("parentId", String(currentParentId));

    setIsUploading(true);
    toast.loading(`${filesToUpload.length}개 파일 업로드 중...`, {
      id: "upload",
    });

    try {
      const uploadUrl = `${BASE}/upload`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        let errorMessage = `업로드 실패 (상태 코드: ${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage =
            errorData?.message ||
            errorData?.error ||
            errorData?.data?.message ||
            errorMessage;
        } catch {
          // JSON parsing failed
        }
        throw new Error(errorMessage);
      }

      let successMessage = `${filesToUpload.length}개 파일이 업로드되었습니다.`;
      try {
        const result = await res.json();
        successMessage = result?.message || successMessage;
      } catch {
        // JSON parsing failed
      }

      toast.success(successMessage, { id: "upload" });
      fetchDriveInfo();
      fetchFiles(currentParentId);
    } catch (e) {
      console.error("uploadFiles error:", e);
      const errorMessage =
        e instanceof Error ? e.message : "파일 업로드 중 오류 발생";
      toast.error(errorMessage, { id: "upload" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0)
      return toast.error("삭제할 파일을 선택해주세요.");
    try {
      const deleteUrl = `${BASE}/delete`;
      const res = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedItems),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`delete status ${res.status}`);

      toast.success(`${selectedItems.length}개 항목이 삭제되었습니다.`);
      setSelectedItems([]);
      fetchDriveInfo();
      fetchFiles(currentParentId);
    } catch (e) {
      console.error("handleDelete error:", e);
      toast.error("삭제 중 오류 발생");
    }
  };

  const handleFolderClick = (folder: FileItem) => {
    setFiles([]);
    setCurrentParentId(folder.id);
    setBreadcrumbPath((prev) => [
      ...prev,
      { id: folder.id, name: folder.name },
    ]);
    setSelectedItems([]);
    setSearchQuery("");
  };

  const handleBreadcrumbClick = (id: number | null, index: number) => {
    setFiles([]);
    setCurrentParentId(id);
    setBreadcrumbPath((prev) => prev.slice(0, index + 1));
    setSelectedItems([]);
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("새 폴더 이름을 입력하세요");
    if (!folderName) return;

    try {
      const folderUrl = `${BASE}/folders`;
      const res = await fetch(folderUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName, parentId: currentParentId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`create folder status ${res.status}`);

      toast.success("폴더가 생성되었습니다.");
      fetchFiles(currentParentId);
    } catch (e) {
      console.error("handleCreateFolder error:", e);
      toast.error("폴더 생성 중 오류 발생");
    }
  };

  const handleDownload = async () => {
    if (selectedItems.length === 0)
      return toast.error("다운로드할 파일을 선택해주세요.");

    try {
      toast.loading(`${selectedItems.length}개 파일 압축 중...`, {
        id: "download",
      });

      const downloadUrl = `${BASE}/download/zip`;
      const res = await fetch(downloadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedItems),
        credentials: "include",
      });

      if (!res.ok) {
        let errorMessage = `다운로드 실패 (상태 코드: ${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch {
          // JSON parsing failed
        }
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");

      let fileName = "download.zip";
      if (contentDisposition) {
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
        if (utf8Match) {
          fileName = decodeURIComponent(utf8Match[1]);
        } else {
          const match = contentDisposition.match(/filename="?([^";]+)"?/i);
          if (match) {
            fileName = match[1];
          }
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `${selectedItems.length}개 파일이 압축되어 다운로드되었습니다.`,
        { id: "download" }
      );
    } catch (e) {
      console.error("handleDownload error:", e);
      const errorMessage =
        e instanceof Error ? e.message : "다운로드 중 오류 발생";
      toast.error(errorMessage, { id: "download" });
    }
  };

  const moveFile = async (fileId: number, newParentId: number | null) => {
    try {
      const moveUrl = `${BASE}/move`;
      const res = await fetch(moveUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: fileId,
          newParentId: newParentId,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        let errorMessage = `이동 실패 (상태 코드: ${res.status})`;
        try {
          const text = await res.text();
          if (text) {
            const errorData = JSON.parse(text);
            errorMessage =
              errorData?.message || errorData?.error || errorMessage;
          }
        } catch {
          // JSON parsing failed
        }
        throw new Error(errorMessage);
      }

      const text = await res.text();
      let result: any = {};
      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          // JSON parsing failed
        }
      }

      toast.success(result?.message || "파일이 이동되었습니다.");
      fetchFiles(currentParentId);
    } catch (e) {
      console.error("moveFile error:", e);
      const errorMessage =
        e instanceof Error ? e.message : "파일 이동 중 오류 발생";
      toast.error(errorMessage);
      throw e;
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedItems,
    setSelectedItems,
    currentParentId,
    setCurrentParentId,
    breadcrumbPath,
    setBreadcrumbPath,
    files,
    setFiles,
    parentFolder,
    setParentFolder,
    isUserMenuOpen,
    setIsUserMenuOpen,
    userEmail,
    setUserEmail,
    usedStorage,
    setUsedStorage,
    totalStorage,
    setTotalStorage,
    isUploading,
    setIsUploading,
    isDragging,
    setIsDragging,
    viewMode,
    setViewMode,
    draggedFileId,
    setDraggedFileId,
    dragOverFolderId,
    setDragOverFolderId,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    isLoadingFiles,
    setIsLoadingFiles,
    dragCounterRef,
    fetchFiles,
    fetchDriveInfo,
    handleSort,
    toggleSelectItem,
    selectAll,
    uploadFiles,
    handleDelete,
    handleFolderClick,
    handleBreadcrumbClick,
    handleCreateFolder,
    handleDownload,
    moveFile,
    currentFiles,
    filteredFiles,
  };
}
