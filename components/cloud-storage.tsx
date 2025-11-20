"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
// import { api } from "@/lib/axios"  // removed — using hardcoded fetch
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
} from "lucide-react";
import Link from "next/link";

interface FileItem {
  id: number;
  name: string;
  type: "file" | "folder";
  size?: string;
  modified: string;
  parentId: number | null;
}

export function CloudStorage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<
    { id: number | null; name: string }[]
  >([{ id: null, name: "내 드라이브" }]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [totalStorage, setTotalStorage] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
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
    try {
      let url = BASE;
      if (parentId != null)
        url += `?parentId=${encodeURIComponent(String(parentId))}`;

      const res = await fetch(url, { method: "GET", credentials: "include" });
      const raw = await res.json();

      // If response is wrapper object, attempt to extract array
      let data: any[] = Array.isArray(raw)
        ? raw
        : raw?.data ?? raw?.items ?? raw?.files ?? null;
      if (!Array.isArray(data)) {
        const maybe = Object.values(raw || {}).find((v) => Array.isArray(v));
        data = Array.isArray(maybe) ? (maybe as any[]) : [];
      }

      const mapped: FileItem[] = data.map((f: any) => ({
        id: Number(f.id),
        name: f.name ?? "Unknown",
        type: f.fileType === "folder" ? "folder" : "file",
        size: f.size != null ? String(f.size) : undefined,
        modified: f.modified ?? f.modifiedAt ?? "",
        parentId: f.parentId != null ? Number(f.parentId) : null,
      }));

      setFiles(mapped);
    } catch (e) {
      console.error("fetchFiles error:", e);
      toast.error("파일을 불러오는 중 오류가 발생했습니다.");
    }
  };

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append("files", file));
    if (currentParentId != null)
      formData.append("parentId", String(currentParentId));

    setIsUploading(true);
    toast.loading(`${selectedFiles.length}개 파일 업로드 중...`, {
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
      let successMessage = `${selectedFiles.length}개 파일이 업로드되었습니다.`;
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
      console.error("handleFileChange error:", e);
      const errorMessage =
        e instanceof Error ? e.message : "파일 업로드 중 오류 발생";
      toast.error(errorMessage, { id: "upload" });
    } finally {
      setIsUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
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
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
      const fileName =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        `file-${fileId}`;

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

  return (
    <div className="min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

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
                  className={`px-4 md:px-6 py-4 hover:bg-muted/30 transition-colors ${
                    selectedItems.includes(file.id) ? "bg-muted/50" : ""
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
                        className={`flex items-center gap-2 mb-1 w-full text-left ${
                          file.type === "folder" ? "cursor-pointer" : ""
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
                        className={`flex items-center gap-3 min-w-0 flex-1 text-left ${
                          file.type === "folder"
                            ? "cursor-pointer hover:text-primary transition-colors"
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
        </div>
      </main>
    </div>
  );
}
