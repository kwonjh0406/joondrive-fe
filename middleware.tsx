import axios from "axios"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("JSESSIONID")?.value

  // 세션 쿠키가 없으면 → 로그인 페이지로 바로 리다이렉트
  if (!sessionId) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 세션 쿠키가 있으면 → 백엔드에 검증 요청
  try {
    const verifyUrl = `${API_URL.replace(/\/$/, "")}/auth/verify`
    const verifyRes = await axios.get(verifyUrl, {
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
      },
      withCredentials: true,
      timeout: 3000,
    })

    if (verifyRes.status !== 200) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|signup|forgot-password).*)'
  ],
}

