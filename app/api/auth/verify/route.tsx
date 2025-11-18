import { cookies } from "next/headers"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080/api"

export async function GET() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("JSESSIONID")?.value

  if (!sessionId) {
    return new Response("세션이 없습니다.", { status: 401 })
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/verify`, {
      headers: {
        Cookie: `JSESSIONID=${sessionId}`,
      },
      credentials: "include",
      cache: "no-store",
    })

    return new Response(await res.text(), { status: res.status })
  } catch (e) {
    console.error("verify 요청 실패:", e)
    return new Response("서버 연결 실패", { status: 500 })
  }
}

