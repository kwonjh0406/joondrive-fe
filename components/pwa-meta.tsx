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
  }, []);

  return null;
}
