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
  MoreVertical,
  Plus,
  Loader2,
  List,
  Grid,
  Image as ImageIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [draggedFileId, setDraggedFileId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
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

      // ApiResponse 구조: { success, message, data }
      // data 구조: { email, usedStorage (바이트), storageLimit (GB) }
      if (response.success && response.data) {
        const { email, usedStorage: usedBytes, storageLimit } = response.data;

        setUserEmail(email || "");
        // usedStorage를 바이트에서 GB로 변환 (1024^3 = 1073741824)
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

      // If response is wrapper object, attempt to extract array
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

  // breadcrumbPath를 사용하여 상위 폴더 정보 가져오기
  useEffect(() => {
    // breadcrumbPath가 2개 이상이면 상위 디렉토리가 있음
    if (breadcrumbPath.length > 1) {
      const parentCrumb = breadcrumbPath[breadcrumbPath.length - 2];

      // 루트 디렉토리는 null이어야 함 (0이 아님)
      if (parentCrumb.id === null) {
        setParentFolder({
          id: -1, // 상위 디렉토리를 나타내는 특별한 ID (null로 이동하기 위해)
          name: "내 드라이브",
          type: "folder",
          size: undefined,
          modified: "",
          parentId: null,
          mimeType: undefined,
        });
      } else {
        // files 배열에서 parentCrumb.id와 일치하는 id를 가진 파일 찾기
        const parentFile = files.find(
          (f) => f.id === parentCrumb.id && f.type === "folder"
        );

        if (parentFile) {
          // 실제 파일 목록에서 찾은 경우 (더 정확한 정보)
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
          // files 배열에 없으면 breadcrumbPath에서 정보 사용
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

  // 파일 크기를 숫자로 변환하는 헬퍼 함수
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

  // 정렬 함수
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
        // 폴더는 항상 파일보다 앞에 오도록
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
      // 같은 필드를 클릭하면 정렬 순서 토글
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 필드를 클릭하면 해당 필드로 정렬 (기본 오름차순)
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === currentFiles.length) setSelectedItems([]);
    else setSelectedItems(currentFiles.map((file) => file.id));
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

  const handleDeleteSingle = async (fileId: number) => {
    try {
      const deleteUrl = `${BASE}/delete`;
      const res = await fetch(deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([fileId]),
        credentials: "include",
      });
      if (!res.ok) throw new Error(`delete status ${res.status}`);

      toast.success("항목이 삭제되었습니다.");
      fetchDriveInfo();
      fetchFiles(currentParentId);
    } catch (e) {
      console.error("handleDeleteSingle error:", e);
      toast.error("삭제 중 오류 발생");
    }
  };

  const handleFolderClick = (folder: FileItem) => {
    // 로딩 시작 전에 파일 목록을 비워서 이전 파일들이 보이지 않도록 함
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
    // 로딩 시작 전에 파일 목록을 비워서 이전 파일들이 보이지 않도록 함
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

    // 소수점 처리: 1보다 작으면 소수점 2자리, 그 외에는 소수점 1자리
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

      // 여러 파일을 압축하여 다운로드
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

      // 파일명 추출 (Content-Disposition 헤더에서)
      let fileName = "download.zip";
      if (contentDisposition) {
        // filename*=UTF-8'' 형식 처리 (한글 파일명)
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
        if (utf8Match) {
          fileName = decodeURIComponent(utf8Match[1]);
        } else {
          // 일반 filename="파일명" 형식 처리
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

  const handleDownloadSingle = async (fileId: number) => {
    try {
      const downloadUrl = `${BASE}/download/${fileId}`;
      const res = await fetch(downloadUrl, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`download status ${res.status}`);

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");

      // 파일명 추출 (Content-Disposition 헤더에서)
      let fileName = "";
      if (contentDisposition) {
        // filename*=UTF-8'' 형식 처리 (한글 파일명)
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
        if (utf8Match) {
          fileName = decodeURIComponent(utf8Match[1]);
        } else {
          // 일반 filename="파일명" 형식 처리
          const match = contentDisposition.match(/filename="?([^";]+)"?/i);
          if (match) {
            fileName = match[1];
          }
        }
      }

      // 백엔드에서 파일명을 보내지 않은 경우, 파일 목록에서 찾기
      if (!fileName) {
        const file = files.find((f) => f.id === fileId);
        fileName = file?.name || `file-${fileId}`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("파일 다운로드가 시작되었습니다.");
    } catch (e) {
      console.error("handleDownloadSingle error:", e);
      toast.error("다운로드 중 오류 발생");
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
    // 파일 업로드와 구분하기 위해 커스텀 데이터 설정
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
    // 파일 업로드가 아닌 경우에만 처리
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

    // 상위 디렉토리로 이동하는 경우 (folderId가 -1이면 null로 이동)
    const targetParentId = folderId === -1 ? null : folderId;

    // 자기 자신의 폴더로 이동하는 것 방지 (targetParentId가 null이 아닐 때만)
    if (targetParentId !== null && itemId === targetParentId) {
      toast.error("자기 자신의 폴더로는 이동할 수 없습니다.");
      return;
    }

    // 폴더를 자기 자신의 자식 폴더로 이동하는 것 방지
    if (itemType === "folder" && targetParentId !== null) {
      const draggedFolder = files.find(
        (f) => f.id === itemId && f.type === "folder"
      );
      if (draggedFolder) {
        // 재귀적으로 자식 폴더인지 확인
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

    // 이미 해당 폴더에 있는지 확인
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
    "h-5 w-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all hover:border-primary/50";
  const fileRowStyles = "px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors";

  // 상위 폴더로 이동하는 함수
  const navigateToParent = () => {
    // 로딩 시작 전에 파일 목록을 비워서 이전 파일들이 보이지 않도록 함
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

  // 파일 아이템 드래그 앤 드롭 핸들러
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

  // 드래그 오버 스타일 가져오기
  const getDragOverClassName = (
    folderId: number | null,
    isMobile: boolean = false
  ) => {
    if (dragOverFolderId === folderId) {
      return isMobile ? dragOverStyles.mobile : dragOverStyles.desktop;
    }
    return "";
  };

  // 파일 액션 메뉴 컴포넌트
  const FileActionsMenu = ({ fileId }: { fileId: number }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownloadSingle(fileId)}>
          <Download className="mr-2 h-4 w-4" /> 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => handleDeleteSingle(fileId)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> 삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const isImageFile = (file: FileItem): boolean => {
    if (file.type === "folder") return false;
    if (!file.mimeType) {
      // mimeType이 없으면 파일 확장자로 판단
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
        ext || ""
      );
    }
    return file.mimeType.startsWith("image/");
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
                className={`hover:text-primary transition-colors ${
                  idx === breadcrumbPath.length - 1
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5 md:mb-6 flex flex-wrap items-center gap-2 md:gap-3">
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
            <span className="hidden sm:inline">
              {isUploading ? "업로드 중..." : "업로드"}
            </span>
          </Button>
          <Button onClick={handleCreateFolder} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 폴더</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={selectedItems.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">다운로드</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">삭제</span>
          </Button>
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
                <Button
                  variant={
                    currentFiles.length > 0 &&
                    selectedItems.length === currentFiles.length
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={selectAll}
                  disabled={currentFiles.length === 0}
                  className="h-8 px-3 text-sm font-medium"
                >
                  전체 선택
                </Button>
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedItems.length > 0 &&
                    `${selectedItems.length}개 선택됨`}
                </span>
              </div>

              {/* 데스크톱 헤더 */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/30 border-b border-border text-xs font-semibold text-foreground/70 items-center">
                <div className="col-span-1 flex items-center justify-start">
                  <Button
                    variant={
                      currentFiles.length > 0 &&
                      selectedItems.length === currentFiles.length
                        ? "default"
                        : "ghost"
                    }
                    size="sm"
                    className="h-7 px-2.5 text-xs font-medium"
                    onClick={selectAll}
                    disabled={currentFiles.length === 0}
                    title="전체 선택"
                  >
                    전체
                  </Button>
                </div>
                <button
                  onClick={() => handleSort("name")}
                  className={`col-span-5 flex items-center gap-1.5 transition-colors text-left ${
                    sortField === "name"
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
                  onClick={() => handleSort("size")}
                  className={`col-span-2 flex items-center gap-1.5 transition-colors text-left ${
                    sortField === "size"
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
                <button
                  onClick={() => handleSort("modified")}
                  className={`col-span-3 flex items-center gap-1.5 transition-colors text-left ${
                    sortField === "modified"
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
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-border">
                {parentFolder && (
                  <div
                    className={fileRowStyles}
                    onDragOver={(e) => handleFolderDragOver(e, parentFolder.id)}
                    onDragLeave={handleFolderDragLeave}
                    onDrop={(e) => handleFolderDrop(e, parentFolder.id)}
                  >
                    <div className="md:hidden flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-5" />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={navigateToParent}
                          className={`flex items-center gap-2 w-full text-left cursor-pointer transition-all ${getDragOverClassName(
                            parentFolder.id,
                            true
                          )}`}
                        >
                          <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            ../{parentFolder.name}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 flex items-center justify-start">
                        <div className="w-5" />
                      </div>
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <button
                          onClick={navigateToParent}
                          className={`flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer hover:text-primary transition-all ${getDragOverClassName(
                            parentFolder.id,
                            false
                          )}`}
                        >
                          <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="font-medium text-foreground truncate">
                            ../{parentFolder.name}
                          </span>
                        </button>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        -
                      </div>
                      <div className="col-span-3 text-sm text-muted-foreground">
                        -
                      </div>
                      <div className="col-span-1"></div>
                    </div>
                  </div>
                )}
                {isLoadingFiles ? (
                  <div className="px-6 py-12 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : currentFiles.length === 0 ? (
                  <div className="px-6 py-12 text-center text-muted-foreground">
                    파일이 없습니다.
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
                      className={`${fileRowStyles} ${
                        selectedItems.includes(file.id) ? "bg-primary/10" : ""
                      } ${draggedFileId === file.id ? "opacity-50" : ""}`}
                    >
                      <div className="md:hidden flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <Checkbox
                            checked={selectedItems.includes(file.id)}
                            onCheckedChange={() => toggleSelectItem(file.id)}
                            className={checkboxStyles}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() =>
                              file.type === "folder" && handleFolderClick(file)
                            }
                            {...getFileDragHandlers(file)}
                            className={`flex items-center gap-2 mb-1 w-full text-left transition-all ${
                              file.type === "folder" ? "cursor-pointer" : ""
                            } ${
                              file.type === "folder"
                                ? getDragOverClassName(file.id, true)
                                : ""
                            }`}
                          >
                            {file.type === "folder" ? (
                              <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="font-medium text-foreground truncate">
                              {file.name}
                            </span>
                          </button>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {file.type === "file" && file.size && (
                              <span>{file.size}</span>
                            )}
                            <span>{file.modified}</span>
                          </div>
                        </div>
                        <FileActionsMenu fileId={file.id} />
                      </div>

                      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 flex items-center justify-start">
                          <Checkbox
                            checked={selectedItems.includes(file.id)}
                            onCheckedChange={() => toggleSelectItem(file.id)}
                            className={checkboxStyles}
                          />
                        </div>
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <button
                            onClick={() =>
                              file.type === "folder" && handleFolderClick(file)
                            }
                            {...getFileDragHandlers(file)}
                            className={`flex items-center gap-3 min-w-0 flex-1 text-left transition-all ${
                              file.type === "folder"
                                ? "cursor-pointer hover:text-primary"
                                : ""
                            } ${
                              file.type === "folder"
                                ? getDragOverClassName(file.id, false)
                                : ""
                            }`}
                          >
                            {file.type === "folder" ? (
                              <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                            ) : (
                              <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="font-medium text-foreground truncate">
                              {file.name}
                            </span>
                          </button>
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {file.type === "file" ? file.size || "-" : "-"}
                        </div>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          {file.modified}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDownloadSingle(file.id)}
                              >
                                <Download className="mr-2 h-4 w-4" /> 다운로드
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteSingle(file.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> 삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-4 md:p-6">
              {/* 그리드 뷰 전체 선택 헤더 */}
              <div className="mb-4 md:mb-5 px-2 border-b border-border pb-3 flex items-center justify-between gap-3">
                <Button
                  variant={
                    currentFiles.length > 0 &&
                    selectedItems.length === currentFiles.length
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={selectAll}
                  disabled={currentFiles.length === 0}
                  className="h-8 px-3 text-sm font-medium"
                >
                  전체 선택
                </Button>
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
                <div className="py-12 text-center text-muted-foreground">
                  파일이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {parentFolder && (
                    <div
                      className={`group relative flex flex-col items-center p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer ${
                        dragOverFolderId === parentFolder.id
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
                        <Folder className="h-12 w-12 text-primary" />
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
                      className={`group relative flex flex-col items-center p-4 rounded-lg border-2 border-border bg-card hover:bg-muted/30 hover:border-primary/30 transition-all cursor-pointer ${
                        selectedItems.includes(file.id) ? "bg-primary/10" : ""
                      } ${draggedFileId === file.id ? "opacity-50" : ""} ${
                        file.type === "folder" && dragOverFolderId === file.id
                          ? "ring-2 ring-primary border-primary bg-primary/20 shadow-sm"
                          : ""
                      }`}
                      onClick={() =>
                        file.type === "folder" && handleFolderClick(file)
                      }
                    >
                      <div className="relative w-full aspect-square mb-3 flex items-center justify-center bg-muted/50 rounded-lg overflow-hidden">
                        {file.type === "folder" ? (
                          <Folder className="h-12 w-12 text-primary" />
                        ) : isImageFile(file) ? (
                          <ThumbnailImage file={file} />
                        ) : (
                          <File className="h-12 w-12 text-muted-foreground" />
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
                        <div
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileActionsMenu fileId={file.id} />
                        </div>
                      </div>
                      <div className="w-full text-center">
                        <p
                          className="text-sm font-medium text-foreground truncate"
                          title={file.name}
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
