import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 인증이 필요한 페이지 접근 시 세션을 검증하는 프록시
 * 세션 쿠키가 없거나 검증 실패 시 로그인 페이지로 리다이렉트
 */
export async function proxy(req: NextRequest) {
  // 세션 쿠키 확인 (JSESSIONID 또는 remember-me)
  const sessionId = req.cookies.get("JSESSIONID")?.value;
  const rememberMe = req.cookies.get("remember-me")?.value;

  if (!sessionId && !rememberMe) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 백엔드 서버에 세션 검증 요청
  try {
    const verifyRes = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 검증 통과 시 요청 계속 진행
  return NextResponse.next();
}

/**
 * 인증 검증이 적용될 경로: / (홈), /account-settings (계정 설정)
 */
export const config = {
  matcher: ["/account-settings"],
};
