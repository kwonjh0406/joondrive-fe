import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="flex flex-col items-center flex-1 p-4 bg-background">
      <div className="w-full max-w-4xl md:mt-8 mt-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>홈으로</span>
            </Button>
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">고객지원</h1>
          <p className="text-muted-foreground">도움이 필요하신가요? 아래 방법으로 문의해주세요.</p>
        </div>
        
        <div className="space-y-8">
          {/* 자주 묻는 질문 */}
          <section className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">자주 묻는 질문 (FAQ)</h2>
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">Q. 파일 업로드 용량 제한이 있나요?</h3>
                <p className="text-muted-foreground">
                  A. 현재 개별 파일 업로드 용량 제한은 100MB입니다. 더 큰 파일을 업로드하려면 
                  파일을 분할하거나 고객지원으로 문의해주세요.
                </p>
              </div>
              
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">Q. 비밀번호를 잊어버렸어요.</h3>
                <p className="text-muted-foreground">
                  A. 로그인 페이지에서 "비밀번호 찾기" 링크를 클릭하시면 등록하신 이메일로 
                  비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>
              
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">Q. 파일이 삭제되었는데 복구할 수 있나요?</h3>
                <p className="text-muted-foreground">
                  A. 삭제된 파일은 30일간 임시 보관되며, 이 기간 내에 복구가 가능합니다. 
                  계정 설정 페이지에서 삭제된 파일을 확인하실 수 있습니다.
                </p>
              </div>
              
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-2">Q. 계정을 삭제하고 싶어요.</h3>
                <p className="text-muted-foreground">
                  A. 계정 설정 페이지에서 계정 삭제를 요청하실 수 있습니다. 
                  계정 삭제 시 모든 데이터가 영구적으로 삭제되며 복구가 불가능합니다.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Q. 서비스 이용 중 오류가 발생했어요.</h3>
                <p className="text-muted-foreground">
                  A. 먼저 브라우저를 새로고침하거나 캐시를 삭제해보세요. 
                  문제가 지속되면 아래 고객지원 이메일로 문의해주시기 바랍니다.
                </p>
              </div>
            </div>
          </section>

          {/* 문의 방법 */}
          <section className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">문의 방법</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">이메일 문의</h3>
                  <p className="text-muted-foreground mb-2">
                    이메일로 문의해주시면 평일 기준 1-2일 내에 답변드립니다.
                  </p>
                  <a 
                    href="mailto:support@joondrive.com" 
                    className="text-primary hover:underline"
                  >
                    support@joondrive.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">운영 시간</h3>
                  <p className="text-muted-foreground">
                    평일: 오전 9시 ~ 오후 6시 (주말 및 공휴일 휴무)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 관련 링크 */}
          <section className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">관련 링크</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/terms"
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-1">이용약관</h3>
                <p className="text-sm text-muted-foreground">서비스 이용 약관을 확인하세요.</p>
              </Link>
              
              <Link 
                href="/privacy"
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                <h3 className="font-semibold text-foreground mb-1">개인정보처리방침</h3>
                <p className="text-sm text-muted-foreground">개인정보 처리 방침을 확인하세요.</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

