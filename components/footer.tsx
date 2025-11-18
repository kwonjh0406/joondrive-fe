import Link from "next/link";

/**
 * 푸터 컴포넌트
 * 모든 페이지 하단에 표시되는 공통 푸터
 */
export function Footer() {
  return (
    <footer className="w-full bg-card/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Joon Drive.</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/support"
              className="hover:text-foreground transition-colors"
            >
              고객지원
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
