import { cookies } from "next/headers";

/**
 * 세션 검증 API Route
 * 프론트엔드에서 받은 세션 쿠키를 백엔드 서버에 전달하여 검증
 */
export async function GET() {
  // 세션 쿠키 확인
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("JSESSIONID")?.value;
  const rememberMe = cookieStore.get("remember-me")?.value;

  // JSESSIONID와 remember-me 둘 다 없으면 401 반환
  if (!sessionId && !rememberMe) {
    return new Response("세션이 없습니다.", { status: 401 });
  }

  // 백엔드로 전달할 쿠키 헤더 구성
  const cookieHeader: string[] = [];
  if (sessionId) {
    cookieHeader.push(`JSESSIONID=${sessionId}`);
  }
  if (rememberMe) {
    cookieHeader.push(`remember-me=${rememberMe}`);
  }

  // 백엔드 서버에 세션 검증 요청
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`,
      {
        headers: {
          Cookie: cookieHeader.join("; "),
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    return new Response(await res.text(), { status: res.status });
  } catch (e) {
    console.error("verify 요청 실패:", e);
    return new Response("서버 연결 실패", { status: 500 });
  }
}
