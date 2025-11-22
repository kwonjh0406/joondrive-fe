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
} from "lucide-react";
import Link from "next/link";

type ViewMode = "list" | "grid";

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
  const dragCounterRef = useRef<number>(0);
  const storagePercentage = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;

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
    }
  };

  // breadcrumb에서 부모 폴더 정보 가져오기
  useEffect(() => {
    if (breadcrumbPath.length > 1) {
      const parentCrumb = breadcrumbPath[breadcrumbPath.length - 2];
      setParentFolder({
        id: parentCrumb.id ?? 0,
        name: parentCrumb.name,
        type: "folder",
        size: undefined,
        modified: "",
        parentId: breadcrumbPath.length > 2 ? breadcrumbPath[breadcrumbPath.length - 3]?.id ?? null : null,
        mimeType: undefined,
      });
    } else {
      setParentFolder(null);
    }
  }, [breadcrumbPath]);

  useEffect(() => {
    fetchDriveInfo();
    fetchFiles(currentParentId);
  }, [currentParentId]);

  const currentFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    toast.loading(`${filesToUpload.length}개 파일 업로드 중...`, { id: "upload" });

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
      const errorMessage = e instanceof Error ? e.message : "파일 업로드 중 오류 발생";
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
    setCurrentParentId(folder.id);
    setBreadcrumbPath((prev) => [
      ...prev,
      { id: folder.id, name: folder.name },
    ]);
    setSelectedItems([]);
    setSearchQuery("");
  };

  const handleBreadcrumbClick = (id: number | null, index: number) => {
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
    const formattedSize = size < 1 
      ? size.toFixed(2) 
      : size >= 100 
      ? Math.round(size).toString()
      : size.toFixed(1);
    
    return `${formattedSize} ${sizes[i]}`;
  };

  const handleDownload = () => {
    if (selectedItems.length === 0)
      return toast.error("다운로드할 파일을 선택해주세요.");
    toast.success(`${selectedItems.length}개 파일 다운로드 시작`);
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
            errorMessage = errorData?.message || errorData?.error || errorMessage;
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
      const errorMessage = e instanceof Error ? e.message : "파일 이동 중 오류 발생";
      toast.error(errorMessage);
      throw e;
    }
  };

  const handleFileDragStart = (e: React.DragEvent, fileId: number) => {
    // 파일 업로드와 구분하기 위해 커스텀 데이터 설정
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/x-file-id", String(fileId));
    setDraggedFileId(fileId);
  };

  const handleFileDragEnd = () => {
    setDraggedFileId(null);
    setDragOverFolderId(null);
  };

  const handleFolderDragOver = (e: React.DragEvent, folderId: number) => {
    // 파일 업로드가 아닌 경우에만 처리
    if (e.dataTransfer.types.includes("application/x-file-id")) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setDragOverFolderId(folderId);
    }
  };

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleFolderDrop = async (e: React.DragEvent, folderId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const fileIdStr = e.dataTransfer.getData("application/x-file-id");
    if (!fileIdStr) return;

    const fileId = Number(fileIdStr);
    if (isNaN(fileId)) return;

    // 자기 자신의 폴더로 이동하는 것 방지
    if (fileId === folderId) {
      toast.error("자기 자신의 폴더로는 이동할 수 없습니다.");
      return;
    }

    // 이미 해당 폴더에 있는지 확인
    const file = files.find((f) => f.id === fileId);
    if (file && file.parentId === folderId) {
      toast.info("이미 해당 폴더에 있습니다.");
      return;
    }

    try {
      await moveFile(fileId, folderId);
      setDraggedFileId(null);
    } catch (e) {
      // 에러는 moveFile에서 이미 처리됨
    }
  };

  const isImageFile = (file: FileItem): boolean => {
    if (file.type === "folder") return false;
    if (!file.mimeType) {
      // mimeType이 없으면 파일 확장자로 판단
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext || "");
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
            <h1 className="text-xl font-bold text-foreground hidden md:block whitespace-nowrap">
              드라이브
            </h1>
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

        {parentFolder && (
          <div
            className={`mb-3 p-3 rounded-lg border border-border bg-muted/30 flex items-center gap-2 transition-colors ${
              dragOverFolderId === parentFolder.id
                ? "bg-primary/10 ring-2 ring-primary"
                : ""
            }`}
            onDragOver={(e) => handleFolderDragOver(e, parentFolder.id)}
            onDragLeave={handleFolderDragLeave}
            onDrop={(e) => handleFolderDrop(e, parentFolder.id)}
          >
            <Folder className="h-4 w-4 text-primary flex-shrink-0" />
            <button
              onClick={() => {
                setCurrentParentId(parentFolder.parentId);
                setBreadcrumbPath((prev) => {
                  const newPath = prev.slice(0, -1);
                  return newPath.length > 0 ? newPath : [{ id: null, name: "내 드라이브" }];
                });
                setSelectedItems([]);
              }}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>←</span>
              <span>{parentFolder.name}</span>
            </button>
            <span className="text-xs text-muted-foreground ml-auto">부모 폴더</span>
          </div>
        )}

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
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={handleCreateFolder}
            className="gap-2 bg-primary/70 hover:bg-primary/63 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새 폴더</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={selectedItems.length === 0}
            className="gap-2 border-border hover:bg-secondary bg-transparent"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">다운로드</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
            className="gap-2 border-border hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">삭제</span>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border rounded-md p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
                title="리스트 뷰"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
                title="그리드 뷰"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
            <Checkbox
              id="select-all"
              checked={
                currentFiles.length > 0 &&
                selectedItems.length === currentFiles.length
              }
              onCheckedChange={selectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              전체 선택
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {viewMode === "list" ? (
            <>
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
                <div className="col-span-1"></div>
                <div className="col-span-5">이름</div>
                <div className="col-span-2">크기</div>
                <div className="col-span-3">수정일</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-border">
                {currentFiles.length === 0 ? (
                  <div className="px-6 py-12 text-center text-muted-foreground">
                    파일이 없습니다.
                  </div>
                ) : (
                  currentFiles.map((file) => (
                <div
                  key={file.id}
                  draggable={file.type === "file"}
                  onDragStart={(e) => file.type === "file" && handleFileDragStart(e, file.id)}
                  onDragEnd={handleFileDragEnd}
                  className={`px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors ${
                    selectedItems.includes(file.id) ? "bg-muted/50" : ""
                  } ${
                    draggedFileId === file.id ? "opacity-50" : ""
                  }`}
                >
                  <div className="md:hidden flex items-start gap-3">
                    <Checkbox
                      checked={selectedItems.includes(file.id)}
                      onCheckedChange={() => toggleSelectItem(file.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          file.type === "folder" && handleFolderClick(file)
                        }
                        onDragOver={(e) =>
                          file.type === "folder" &&
                          handleFolderDragOver(e, file.id)
                        }
                        onDragLeave={handleFolderDragLeave}
                        onDrop={(e) =>
                          file.type === "folder" && handleFolderDrop(e, file.id)
                        }
                        className={`flex items-center gap-2 mb-1 w-full text-left ${
                          file.type === "folder" ? "cursor-pointer" : ""
                        } ${
                          file.type === "folder" && dragOverFolderId === file.id
                            ? "bg-primary/10 ring-2 ring-primary rounded"
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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

                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedItems.includes(file.id)}
                        onCheckedChange={() => toggleSelectItem(file.id)}
                      />
                    </div>
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <button
                        onClick={() =>
                          file.type === "folder" && handleFolderClick(file)
                        }
                        onDragOver={(e) =>
                          file.type === "folder" &&
                          handleFolderDragOver(e, file.id)
                        }
                        onDragLeave={handleFolderDragLeave}
                        onDrop={(e) =>
                          file.type === "folder" && handleFolderDrop(e, file.id)
                        }
                        className={`flex items-center gap-3 min-w-0 flex-1 text-left ${
                          file.type === "folder"
                            ? "cursor-pointer hover:text-primary transition-colors"
                            : ""
                        } ${
                          file.type === "folder" && dragOverFolderId === file.id
                            ? "bg-primary/10 ring-2 ring-primary rounded px-2 py-1"
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
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
              {currentFiles.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  파일이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {currentFiles.map((file) => (
                    <div
                      key={file.id}
                      draggable={file.type === "file"}
                      onDragStart={(e) => file.type === "file" && handleFileDragStart(e, file.id)}
                      onDragEnd={handleFileDragEnd}
                      onDragOver={(e) =>
                        file.type === "folder" &&
                        handleFolderDragOver(e, file.id)
                      }
                      onDragLeave={handleFolderDragLeave}
                      onDrop={(e) =>
                        file.type === "folder" && handleFolderDrop(e, file.id)
                      }
                      className={`group relative flex flex-col items-center p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer ${
                        selectedItems.includes(file.id)
                          ? "ring-2 ring-primary bg-muted/50"
                          : ""
                      } ${
                        draggedFileId === file.id ? "opacity-50" : ""
                      } ${
                        file.type === "folder" && dragOverFolderId === file.id
                          ? "ring-2 ring-primary bg-primary/10"
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
                        <div className="absolute top-2 left-2">
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
                            className="bg-background/80"
                          />
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 bg-background/80 hover:bg-background"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSingle(file.id);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" /> 다운로드
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingle(file.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> 삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="w-full text-center">
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
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
