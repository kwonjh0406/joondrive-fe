"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Search,
  Upload,
  Download,
  Trash2,
  File,
  Folder,
  User,
  Settings,
  LogOut,
  Plus,
  Loader2,
  List,
  Grid,
  Image as ImageIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Inbox,
} from "lucide-react";
import Link from "next/link";

type ViewMode = "list" | "grid";
type SortField = "name" | "modified" | "size";
type SortOrder = "asc" | "desc";

interface FileItem {
  id: number;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  parentId: number | null;
  mimeType?: string;
}

// 썸네일 이미지 컴포넌트
function ThumbnailImage({ file }: { file: FileItem }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadThumbnail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/files/download/${file.id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load thumbnail");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (isMounted) {
          setThumbnailUrl(url);
          setIsLoading(false);
        } else {
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.error("썸네일 로드 실패:", e);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadThumbnail();

    return () => {
      isMounted = false;
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.id]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasError || !thumbnailUrl) {
    return <ImageIcon className="h-12 w-12 text-muted-foreground" />;
  }

  return (
    <img
      src={thumbnailUrl}
      alt={file.name}
      className="w-full h-full object-cover"
    />
  );
}

export function CloudStorage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    { id: number | null; name: string }[]
  >([{ id: null, name: "내 드라이브" }]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [parentFolder, setParentFolder] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const storagePercentage =
    totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;

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

  const handleUpload = () => fileInputRef.current?.click();

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
        // 백엔드에서 반환하는 에러 메시지 추출
        let errorMessage = `업로드 실패 (상태 코드: ${res.status})`;
        try {
          const errorData = await res.json();
          errorMessage =
            errorData?.message ||
            errorData?.error ||
            errorData?.data?.message ||
            errorMessage;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        throw new Error(errorMessage);
      }

      // 성공 응답 처리
      let successMessage = `${filesToUpload.length}개 파일이 업로드되었습니다.`;
      try {
        const result = await res.json();
        successMessage = result?.message || successMessage;
      } catch {
        // JSON 응답이 없으면 기본 메시지 사용
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    await uploadFiles(selectedFiles);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      // 실제 파일이 있는지 확인 (파일 리스트 항목 드래그 방지)
      const hasFiles = e.dataTransfer?.files && e.dataTransfer.files.length > 0;
      // 또는 dataTransfer.items에서 파일 타입이 있는지 확인
      const hasFileItems = Array.from(e.dataTransfer?.items || []).some(
        (item) => item.kind === "file"
      );

      if (hasFiles || hasFileItems) {
        dragCounterRef.current += 1;
        if (dragCounterRef.current === 1) {
          setIsDragging(true);
        }
      }
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      // 실제 파일이 있는 경우에만 dropEffect 설정
      const hasFiles = e.dataTransfer?.files && e.dataTransfer.files.length > 0;
      const hasFileItems = Array.from(e.dataTransfer?.items || []).some(
        (item) => item.kind === "file"
      );

      if (hasFiles || hasFileItems) {
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = "copy";
        }
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);

      // 실제 파일이 있는지 확인
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        await uploadFiles(droppedFiles);
      }
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [currentParentId]);

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
          // JSON 파싱 실패 시 기본 메시지 사용
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


  const handleLogout = () => toast.success("로그아웃되었습니다.");

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
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        throw new Error(errorMessage);
      }

      // 응답 본문 확인
      const text = await res.text();
      let result: any = {};
      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          // JSON이 아닌 경우 빈 객체 사용
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

  const handleItemDragStart = (
    e: React.DragEvent,
    itemId: number,
    itemType: "file" | "folder"
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-file-id", String(itemId));
    e.dataTransfer.setData("application/x-item-type", itemType);
    setDraggedFileId(itemId);
  };

  const handleFileDragEnd = () => {
    setDraggedFileId(null);
    setDragOverFolderId(null);
  };

  const handleFolderDragOver = (
    e: React.DragEvent,
    folderId: number | null
  ) => {
    if (e.dataTransfer.types.includes("application/x-file-id")) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      // 상위 디렉토리(-1)도 그대로 전달하여 드래그 효과 표시
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = async (
    e: React.DragEvent,
    folderId: number | null
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const itemIdStr = e.dataTransfer.getData("application/x-file-id");
    if (!itemIdStr) return;

    const itemId = Number(itemIdStr);
    if (isNaN(itemId)) return;

    const itemType = e.dataTransfer.getData("application/x-item-type") as
      | "file"
      | "folder"
      | "";

    const targetParentId = folderId === -1 ? null : folderId;

    if (targetParentId !== null && itemId === targetParentId) {
      toast.error("자기 자신의 폴더로는 이동할 수 없습니다.");
      return;
    }

    if (itemType === "folder" && targetParentId !== null) {
      const draggedFolder = files.find(
        (f) => f.id === itemId && f.type === "folder"
      );
      if (draggedFolder) {
        const isDescendant = (folderId: number, targetId: number): boolean => {
          const folder = files.find((f) => f.id === folderId);
          if (!folder || folder.parentId === null) return false;
          if (folder.parentId === targetId) return true;
          return isDescendant(folder.parentId, targetId);
        };

        if (isDescendant(targetParentId, itemId)) {
          toast.error("자기 자신의 하위 폴더로는 이동할 수 없습니다.");
          return;
        }
      }
    }

    const item = files.find((f) => f.id === itemId);
    if (item && item.parentId === targetParentId) {
      toast.info("이미 해당 폴더에 있습니다.");
      return;
    }

    try {
      await moveFile(itemId, targetParentId);
      setDraggedFileId(null);
    } catch (e) {
      // 에러는 moveFile에서 이미 처리됨
    }
  };

  // 스타일 상수
  const dragOverStyles = {
    mobile:
      "bg-primary/20 ring-2 ring-primary border-l-4 border-primary rounded shadow-sm px-2 -mx-2",
    desktop:
      "bg-primary/20 ring-2 ring-primary border-l-4 border-primary rounded shadow-sm px-3 py-2 -mx-3",
  };

  const checkboxStyles =
    "h-5 w-5 rounded-[4px] border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all hover:border-primary hover:bg-primary/5";
  const fileRowStyles = "px-4 md:px-6 py-3 transition-colors border-b border-border";

  const navigateToParent = () => {
    setFiles([]);
    if (breadcrumbPath.length > 1) {
      const parentCrumb = breadcrumbPath[breadcrumbPath.length - 2];
      setCurrentParentId(parentCrumb.id);
      setBreadcrumbPath((prev) => prev.slice(0, -1));
    } else {
      setCurrentParentId(null);
      setBreadcrumbPath([{ id: null, name: "내 드라이브" }]);
    }
    setSelectedItems([]);
  };

  const getFileDragHandlers = (file: FileItem) => ({
    onDragOver:
      file.type === "folder"
        ? (e: React.DragEvent) => handleFolderDragOver(e, file.id)
        : undefined,
    onDragLeave: file.type === "folder" ? handleFolderDragLeave : undefined,
    onDrop:
      file.type === "folder"
        ? (e: React.DragEvent) => handleFolderDrop(e, file.id)
        : undefined,
  });

  const getDragOverClassName = (
    folderId: number | null,
    isMobile: boolean = false
  ) => {
    if (dragOverFolderId === folderId) {
      return isMobile ? dragOverStyles.mobile : dragOverStyles.desktop;
    }
    return "";
  };


  const isImageFile = (file: FileItem): boolean => {
    if (file.type === "folder") return false;
    if (!file.mimeType) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
        ext || ""
      );
    }
    return file.mimeType.startsWith("image/");
  };

  // 파일 타입별 아이콘 색상 반환
  const getFileIconColor = (file: FileItem): string => {
    if (file.type === "folder") {
      return "text-yellow-500"; // 폴더는 노란색
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = file.mimeType?.toLowerCase() || "";

    // 이미지 파일
    if (
      mimeType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico"].includes(ext)
    ) {
      return "text-blue-500";
    }

    // 비디오 파일
    if (
      mimeType.startsWith("video/") ||
      ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv", "m4v"].includes(ext)
    ) {
      return "text-purple-500";
    }

    // 오디오 파일
    if (
      mimeType.startsWith("audio/") ||
      ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(ext)
    ) {
      return "text-green-500";
    }

    // 문서 파일
    if (
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("word") ||
      ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf"].includes(ext)
    ) {
      return "text-red-500";
    }

    // 압축 파일
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      ["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)
    ) {
      return "text-orange-500";
    }

    // 코드 파일
    if (
      ["js", "ts", "jsx", "tsx", "html", "css", "json", "xml", "py", "java", "cpp", "c", "go", "rs"].includes(ext)
    ) {
      return "text-indigo-500";
    }

    // 기본 색상 (회색)
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary rounded-lg m-4 pointer-events-none">
          <div className="text-center pointer-events-auto">
            <Upload className="h-16 w-16 mx-auto mb-4 text-primary animate-bounce" />
            <p className="text-xl font-semibold text-foreground">
              파일을 여기에 놓으세요
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              드래그 앤 드롭으로 파일을 업로드할 수 있습니다
            </p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-2xl min-w-0">
            <button
              onClick={() => {
                setCurrentParentId(null);
                setBreadcrumbPath([{ id: null, name: "내 드라이브" }]);
                setSelectedItems([]);
              }}
              className="text-xl font-semibold text-foreground hidden md:block whitespace-nowrap hover:text-primary transition-colors cursor-pointer"
            >
              드라이브
            </button>
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="파일 검색..."
                className="pl-10 bg-input border-border focus:ring-primary h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-sm text-muted-foreground">
              {userEmail}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full flex-shrink-0"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isUserMenuOpen && (
          <div className="border-t border-border bg-card">
            <div className="container mx-auto px-4 md:px-6">
              <div className="py-3">
                <div className="mb-3 pb-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">내 계정</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userEmail}
                  </p>
                </div>
                <Link
                  href="/account-settings"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-left transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">계정 설정</span>
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 text-left transition-colors"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">로그아웃</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6 md:mb-8 rounded-xl border border-border bg-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-foreground">
              저장소 사용량
            </h2>
            <span className="text-sm text-muted-foreground">
              {usedStorage.toFixed(1)} GB / {totalStorage} GB
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
        </div>

        <div className="mb-4 md:mb-5 flex items-center gap-2 text-sm">
          {breadcrumbPath.map((crumb, idx) => (
            <div key={crumb.id ?? "root"} className="flex items-center gap-2">
              {idx > 0 && <span className="text-muted-foreground">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(crumb.id, idx)}
                className={`hover:text-primary transition-colors ${idx === breadcrumbPath.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
                  }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5 md:mb-6 flex flex-wrap items-center gap-2 md:gap-3 relative min-h-[40px]">
          {selectedItems.length > 0 ? (
            <div className="flex items-center gap-2 md:gap-3 animate-fade-in">
              <Button
                variant="secondary"
                onClick={handleDownload}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">다운로드</span>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-2 shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">삭제</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 animate-fade-in">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-2 shadow-sm"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isUploading ? "업로드 중..." : "업로드"}
                </span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleCreateFolder}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">새 폴더</span>
              </Button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">정렬</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  <div className="flex items-center justify-between w-full">
                    <span>이름</span>
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      ))}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("modified")}>
                  <div className="flex items-center justify-between w-full">
                    <span>수정일</span>
                    {sortField === "modified" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      ))}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("size")}>
                  <div className="flex items-center justify-between w-full">
                    <span>크기</span>
                    {sortField === "size" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="h-4 w-4 text-primary" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-primary" />
                      ))}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("list")}
                title="리스트 뷰"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon-sm"
                onClick={() => setViewMode("grid")}
                title="그리드 뷰"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {viewMode === "list" ? (
            <>
              {/* 모바일 전체 선택 버튼 */}
              <div className="md:hidden px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      currentFiles.length > 0 &&
                      selectedItems.length === currentFiles.length
                    }
                    onCheckedChange={selectAll}
                    disabled={currentFiles.length === 0}
                    className={checkboxStyles}
                  />
                  <span className="text-sm text-foreground">
                    전체 선택
                  </span>
                </div>
                {selectedItems.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {selectedItems.length}개 선택됨
                  </span>
                )}
              </div>

              {/* 데스크톱 헤더 */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-semibold text-foreground/70 items-center">
                <div className="col-span-1 flex items-center justify-start">
                  <Checkbox
                    checked={
                      currentFiles.length > 0 &&
                      selectedItems.length === currentFiles.length
                    }
                    onCheckedChange={selectAll}
                    disabled={currentFiles.length === 0}
                    className={checkboxStyles}
                    title="전체 선택"
                  />
                </div>
                <button
                  onClick={() => handleSort("name")}
                  className={`col-span-6 flex items-center gap-1.5 transition-colors text-left ${sortField === "name"
                    ? "text-foreground font-semibold"
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
                  onClick={() => handleSort("modified")}
                  className={`col-span-4 flex items-center gap-1.5 transition-colors text-left ${sortField === "modified"
                    ? "text-foreground font-semibold"
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
                  onClick={() => handleSort("size")}
                  className={`col-span-1 flex items-center justify-end gap-1.5 transition-colors text-right ${sortField === "size"
                    ? "text-foreground font-semibold"
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
                    onClick={navigateToParent}
                    onDragOver={(e) => handleFolderDragOver(e, parentFolder.id)}
                    onDragLeave={handleFolderDragLeave}
                    onDrop={(e) => handleFolderDrop(e, parentFolder.id)}
                  >
                    <div className="md:hidden flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5" />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`flex items-center gap-2 w-full text-left transition-all ${getDragOverClassName(
                            parentFolder.id,
                            true
                          )}`}
                        >
                          <Folder className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            ../{parentFolder.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 flex items-center justify-start">
                        <div className="w-5" />
                      </div>
                      <div className="col-span-6 flex items-center gap-3 min-w-0">
                        <div
                          className={`flex items-center gap-3 min-w-0 flex-1 text-left transition-all ${getDragOverClassName(
                            parentFolder.id,
                            false
                          )}`}
                        >
                          <Folder className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            ../{parentFolder.name}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 text-sm text-muted-foreground">
                        -
                      </div>
                      <div className="col-span-1 text-sm text-muted-foreground text-right">
                        -
                      </div>
                    </div>
                  </div>
                )}
                {isLoadingFiles ? (
                  <div className="px-6 py-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : currentFiles.length === 0 ? (
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
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="gap-2"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        <span>파일 업로드</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCreateFolder}
                        className="gap-2"
                      >
                        <FolderPlus className="h-4 w-4" />
                        <span>새 폴더</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  currentFiles.map((file, index) => (
                    <div
                      key={file.id}
                      draggable={true}
                      onDragStart={(e) =>
                        handleItemDragStart(e, file.id, file.type)
                      }
                      onDragEnd={handleFileDragEnd}
                      onClick={() => toggleSelectItem(file.id)}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (file.type === "folder") {
                          handleFolderClick(file);
                        }
                      }}
                      className={`${fileRowStyles} cursor-pointer ${selectedItems.includes(file.id)
                        ? "bg-primary/20 border-b-border"
                        : "hover:bg-muted/30"
                        } ${draggedFileId === file.id ? "opacity-50" : ""}`}
                    >
                      <div className="md:hidden flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={selectedItems.includes(file.id)}
                            onCheckedChange={() => toggleSelectItem(file.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={checkboxStyles}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <div
                            {...getFileDragHandlers(file)}
                            className={`flex items-center gap-2 flex-1 min-w-0 text-left transition-all ${file.type === "folder"
                              ? getDragOverClassName(file.id, true)
                              : ""
                              }`}
                          >
                            {file.type === "folder" ? (
                              <Folder className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <File className={`h-5 w-5 ${getFileIconColor(file)} flex-shrink-0`} />
                            )}
                            <span
                              className={`font-medium truncate ${file.type === "folder"
                                ? "text-primary cursor-pointer hover:underline"
                                : "text-foreground"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                  handleFolderClick(file);
                                } else {
                                  toggleSelectItem(file.id);
                                }
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                  handleFolderClick(file);
                                }
                              }}
                            >
                              {file.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 text-[11px] text-muted-foreground flex-shrink-0">
                          <span>{file.modified}</span>
                          {file.type === "file" && file.size && (
                            <span>{file.size}</span>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 flex items-center justify-start">
                          <Checkbox
                            checked={selectedItems.includes(file.id)}
                            onCheckedChange={() => toggleSelectItem(file.id)}
                            onClick={(e) => e.stopPropagation()}
                            className={checkboxStyles}
                          />
                        </div>
                        <div className="col-span-6 flex items-center gap-3 min-w-0">
                          <div
                            {...getFileDragHandlers(file)}
                            className={`flex items-center gap-3 min-w-0 flex-1 text-left transition-all ${file.type === "folder"
                              ? getDragOverClassName(file.id, false)
                              : ""
                              }`}
                          >
                            {file.type === "folder" ? (
                              <Folder className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                            ) : (
                              <File className={`h-6 w-6 ${getFileIconColor(file)} flex-shrink-0`} />
                            )}
                            <span
                              className={`font-medium truncate ${file.type === "folder"
                                ? "text-primary cursor-pointer hover:underline hover:text-primary"
                                : "text-foreground"
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                  handleFolderClick(file);
                                } else {
                                  toggleSelectItem(file.id);
                                }
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                if (file.type === "folder") {
                                  handleFolderClick(file);
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
                  ))
                )}
              </div>
            </>
          ) : (
            <div>
              {/* 그리드 뷰 전체 선택 헤더 */}
              <div className="px-4 py-2.5 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      currentFiles.length > 0 &&
                      selectedItems.length === currentFiles.length
                    }
                    onCheckedChange={selectAll}
                    disabled={currentFiles.length === 0}
                    className={checkboxStyles}
                  />
                  <span className="text-sm text-foreground">
                    전체 선택
                  </span>
                </div>
                {selectedItems.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {selectedItems.length}개 선택됨
                  </span>
                )}
              </div>
              {isLoadingFiles ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : currentFiles.length === 0 && !parentFolder ? (
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
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>파일 업로드</span>
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCreateFolder}
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
                      onDragOver={(e) =>
                        handleFolderDragOver(e, parentFolder.id)
                      }
                      onDragLeave={handleFolderDragLeave}
                      onDrop={(e) => handleFolderDrop(e, parentFolder.id)}
                      onClick={navigateToParent}
                    >
                      <div className="relative w-full aspect-square mb-3 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                        <Folder className="h-12 w-12 text-yellow-500" />
                      </div>
                      <div className="w-full text-center">
                        <p
                          className="text-sm font-medium text-foreground break-words"
                          title={`../${parentFolder.name}`}
                        >
                          ../{parentFolder.name}
                        </p>
                      </div>
                    </div>
                  )}
                  {currentFiles.map((file) => (
                    <div
                      key={file.id}
                      draggable={true}
                      onDragStart={(e) =>
                        handleItemDragStart(e, file.id, file.type)
                      }
                      onDragEnd={handleFileDragEnd}
                      onDragOver={(e) =>
                        file.type === "folder" &&
                        handleFolderDragOver(e, file.id)
                      }
                      onDragLeave={handleFolderDragLeave}
                      onDrop={(e) =>
                        file.type === "folder" && handleFolderDrop(e, file.id)
                      }
                      className={`group relative flex flex-col items-center p-4 rounded-lg border border-border bg-card transition-all cursor-pointer ${selectedItems.includes(file.id)
                        ? "bg-primary/20 border-primary/50"
                        : "hover:bg-muted/30 hover:border-primary/30"
                        } ${draggedFileId === file.id ? "opacity-50" : ""} ${file.type === "folder" && dragOverFolderId === file.id
                          ? "ring-2 ring-primary border-primary bg-primary/20 shadow-sm"
                          : ""
                        }`}
                      onClick={() => toggleSelectItem(file.id)}
                      onDoubleClick={() =>
                        file.type === "folder" && handleFolderClick(file)
                      }
                    >
                      <div className="relative w-full aspect-square mb-3 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                        {file.type === "folder" ? (
                          <Folder className="h-12 w-12 text-yellow-500" />
                        ) : isImageFile(file) ? (
                          <ThumbnailImage file={file} />
                        ) : (
                          <File className={`h-12 w-12 ${getFileIconColor(file)}`} />
                        )}
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={selectedItems.includes(file.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedItems((prev) => [...prev, file.id]);
                              } else {
                                setSelectedItems((prev) =>
                                  prev.filter((id) => id !== file.id)
                                );
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className={`${checkboxStyles} bg-background/95 backdrop-blur-sm shadow-md hover:scale-110`}
                          />
                        </div>
                      </div>
                      <div className="w-full text-center">
                        <p
                          className={`text-sm font-medium truncate ${file.type === "folder"
                            ? "text-primary cursor-pointer hover:underline"
                            : "text-foreground"
                            }`}
                          title={file.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (file.type === "folder") {
                              handleFolderClick(file);
                            }
                          }}
                        >
                          {file.name}
                        </p>
                        {file.size && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {file.size}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
