import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api"

export async function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("JSESSIONID")?.value

  if (!sessionId) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const verifyUrl = `${API_URL.replace(/\/$/, "")}/auth/verify`
    const verifyRes = await fetch(verifyUrl, {
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!verifyRes.ok) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  } catch {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|signup|forgot-password).*)",
  ],
}
