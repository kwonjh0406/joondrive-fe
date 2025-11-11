"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Search, Upload, Download, Trash2, File, Folder, User, Settings, LogOut, MoreVertical } from "lucide-react"
import Link from "next/link"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  modified: string
  path: string
  parentPath: string
}

export function CloudStorage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [currentPath, setCurrentPath] = useState("/")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "프로젝트 문서.pdf",
      type: "file",
      size: "2.4 MB",
      modified: "2024-01-15",
      path: "/프로젝트 문서.pdf",
      parentPath: "/",
    },
    {
      id: "2",
      name: "이미지 폴더",
      type: "folder",
      modified: "2024-01-14",
      path: "/이미지 폴더",
      parentPath: "/",
    },
    {
      id: "3",
      name: "회의록.docx",
      type: "file",
      size: "156 KB",
      modified: "2024-01-13",
      path: "/회의록.docx",
      parentPath: "/",
    },
    {
      id: "4",
      name: "스프레드시트.xlsx",
      type: "file",
      size: "892 KB",
      modified: "2024-01-12",
      path: "/스프레드시트.xlsx",
      parentPath: "/",
    },
    {
      id: "5",
      name: "디자인 파일",
      type: "folder",
      modified: "2024-01-11",
      path: "/디자인 파일",
      parentPath: "/",
    },
    {
      id: "6",
      name: "사진1.jpg",
      type: "file",
      size: "3.2 MB",
      modified: "2024-01-10",
      path: "/이미지 폴더/사진1.jpg",
      parentPath: "/이미지 폴더",
    },
    {
      id: "7",
      name: "사진2.png",
      type: "file",
      size: "2.8 MB",
      modified: "2024-01-09",
      path: "/이미지 폴더/사진2.png",
      parentPath: "/이미지 폴더",
    },
  ])

  const usedStorage = 12.4
  const totalStorage = 50
  const storagePercentage = (usedStorage / totalStorage) * 100
  const userEmail = "user@example.com"

  const currentFiles = files.filter(
    (file) => file.parentPath === currentPath && file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const selectAll = () => {
    if (selectedItems.length === currentFiles.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(currentFiles.map((file) => file.id))
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFiles: FileItem[] = Array.from(selectedFiles).map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      type: "file" as const,
      size: formatFileSize(file.size),
      modified: new Date().toISOString().split("T")[0],
      path: `${currentPath}${currentPath === "/" ? "" : "/"}${file.name}`,
      parentPath: currentPath,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`${selectedFiles.length}개 파일이 업로드되었습니다.`)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleDownload = () => {
    if (selectedItems.length === 0) {
      toast.error("다운로드할 파일을 선택해주세요.")
      return
    }
    toast.success(`${selectedItems.length}개 파일 다운로드를 시작합니다.`)
  }

  const handleDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("삭제할 파일을 선택해주세요.")
      return
    }
    setFiles((prev) => prev.filter((file) => !selectedItems.includes(file.id)))
    setSelectedItems([])
    toast.success(`${selectedItems.length}개 파일이 삭제되었습니다.`)
  }

  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath)
    setSelectedItems([])
    setSearchQuery("")
  }

  const getBreadcrumbs = () => {
    if (currentPath === "/") return [{ name: "내 드라이브", path: "/" }]
    const parts = currentPath.split("/").filter(Boolean)
    const breadcrumbs = [{ name: "내 드라이브", path: "/" }]
    let accumulatedPath = ""
    parts.forEach((part) => {
      accumulatedPath += `/${part}`
      breadcrumbs.push({ name: part, path: accumulatedPath })
    })
    return breadcrumbs
  }

  const handleLogout = () => {
    toast.success("로그아웃되었습니다.")
  }

  return (
    <div className="min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="파일 업로드"
      />

      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-2xl min-w-0">
            <h1 className="text-xl font-semibold text-foreground hidden md:block whitespace-nowrap">Joon Drive</h1>
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="파일 검색..."
                className="pl-10 bg-background border-border w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:block text-sm text-muted-foreground">{userEmail}</span>
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
                  <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>
                </div>
                <Link
                  href="/account-settings"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent text-left transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">계정 설정</span>
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent text-left transition-colors"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    handleLogout()
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
            <h2 className="text-sm font-medium text-foreground">저장소 사용량</h2>
            <span className="text-sm text-muted-foreground">
              {usedStorage} GB / {totalStorage} GB
            </span>
          </div>
          <Progress value={storagePercentage} className="h-2" />
        </div>

        <div className="mb-4 md:mb-5 flex items-center gap-2 text-sm">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {index > 0 && <span className="text-muted-foreground">/</span>}
              <button
                onClick={() => handleFolderClick(crumb.path)}
                className={`hover:text-primary transition-colors ${
                  index === getBreadcrumbs().length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        <div className="mb-5 md:mb-6 flex flex-wrap items-center gap-2 md:gap-3">
          <Button onClick={handleUpload} className="gap-2">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">업로드</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={selectedItems.length === 0}
            className="gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">다운로드</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selectedItems.length === 0}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">삭제</span>
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={currentFiles.length > 0 && selectedItems.length === currentFiles.length}
              onCheckedChange={selectAll}
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer select-none">
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
              <div className="px-6 py-12 text-center text-muted-foreground">파일이 없습니다.</div>
            ) : (
              currentFiles.map((file) => (
                <div
                  key={file.id}
                  className={`px-4 md:px-6 py-4 hover:bg-accent/50 transition-colors ${
                    selectedItems.includes(file.id) ? "bg-accent/30" : ""
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
                        onClick={() => file.type === "folder" && handleFolderClick(file.path)}
                        className={`flex items-center gap-2 mb-1 w-full text-left ${
                          file.type === "folder" ? "cursor-pointer" : ""
                        }`}
                      >
                        {file.type === "folder" ? (
                          <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="font-medium text-foreground truncate">{file.name}</span>
                      </button>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {file.size && <span>{file.size}</span>}
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
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          삭제
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
                        onClick={() => file.type === "folder" && handleFolderClick(file.path)}
                        className={`flex items-center gap-3 min-w-0 flex-1 text-left ${
                          file.type === "folder" ? "cursor-pointer hover:text-primary transition-colors" : ""
                        }`}
                      >
                        {file.type === "folder" ? (
                          <Folder className="h-5 w-5 text-primary flex-shrink-0" />
                        ) : (
                          <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="font-medium text-foreground truncate">{file.name}</span>
                      </button>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{file.size || "-"}</div>
                    <div className="col-span-3 text-sm text-muted-foreground">{file.modified}</div>
                    <div className="col-span-1 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            다운로드
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
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
  )
}
