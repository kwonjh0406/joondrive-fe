"use client";

import { useEffect } from "react";

export function PWAMeta() {
  useEffect(() => {
    // 동적으로 메타 태그 추가
    const addMetaTag = (name: string, content: string) => {
      if (document.querySelector(`meta[name="${name}"]`)) {
        return;
      }
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    };

    const addLinkTag = (rel: string, href: string, sizes?: string) => {
      const existing = document.querySelector(`link[rel="${rel}"]`);
      if (existing) {
        return;
      }
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (sizes) {
        link.setAttribute("sizes", sizes);
      }
      document.head.appendChild(link);
    };

    // iOS 전체화면을 위한 메타 태그
    addMetaTag("apple-mobile-web-app-capable", "yes");
    addMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
    addMetaTag("apple-mobile-web-app-title", "Joon Drive");
    addMetaTag("mobile-web-app-capable", "yes");
    addMetaTag("theme-color", "#000000");
    
    // Viewport 설정 (전체화면을 위해)
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    } else {
      addMetaTag(
        "viewport",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    }

    // Manifest 링크
    addLinkTag("manifest", "/manifest.json");
    addLinkTag("apple-touch-icon", "/apple-icon-180x180.png");
  }, []);

  return null;
}

