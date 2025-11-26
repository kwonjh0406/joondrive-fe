import { FileItem } from "@/types/drive";

export const isImageFile = (file: FileItem): boolean => {
    if (file.type === "folder") return false;
    if (!file.mimeType) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        return ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(
            ext || ""
        );
    }
    return file.mimeType.startsWith("image/");
};

export const getFileIconColor = (file: FileItem): string => {
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
        [
            "pdf",
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "txt",
            "rtf",
        ].includes(ext)
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
        [
            "js",
            "ts",
            "jsx",
            "tsx",
            "html",
            "css",
            "json",
            "xml",
            "py",
            "java",
            "cpp",
            "c",
            "go",
            "rs",
        ].includes(ext)
    ) {
        return "text-indigo-500";
    }

    // 기본 색상 (회색)
    return "text-muted-foreground";
};

export const dragOverStyles = {
    mobile:
        "bg-primary/20 ring-2 ring-primary border-l-4 border-primary rounded shadow-sm px-2 -mx-2",
    desktop:
        "bg-primary/20 ring-2 ring-primary border-l-4 border-primary rounded shadow-sm px-3 py-2 -mx-3",
};

export const checkboxStyles =
    "h-4 w-4 rounded-[4px] border border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary transition-all hover:bg-muted/50";

export const fileRowStyles =
    "px-4 md:px-6 py-3 transition-colors";
