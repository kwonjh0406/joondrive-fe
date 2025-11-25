"use client";

import { useEffect } from "react";

export function PWAMeta() {
  useEffect(() => {
    // 1. 기존 서비스 워커 강제 해제 (캐시 문제 해결)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    }

    // 2. Viewport 설정 (viewport-fit=cover 포함)
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
      document.head.appendChild(meta);
    }

    // 3. theme-color 메타 태그 강제 설정 (iOS PWA 상단 노치 영역 색상)
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", "#ffffff");
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#ffffff";
      document.head.appendChild(meta);
    }

    // 4. iOS 전용 apple-mobile-web-app-status-bar-style 설정
    const statusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBarStyle) {
      statusBarStyle.setAttribute("content", "default");
    } else {
      const meta = document.createElement("meta");
      meta.name = "apple-mobile-web-app-status-bar-style";
      meta.content = "default";
      document.head.appendChild(meta);
    }
  }, []);

  return null;
}
