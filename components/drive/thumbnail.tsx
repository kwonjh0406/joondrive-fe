"use client";

import { useState, useEffect } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { FileItem } from "@/hooks/use-drive";

interface ThumbnailImageProps {
    file: FileItem;
}

export function ThumbnailImage({ file }: ThumbnailImageProps) {
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
