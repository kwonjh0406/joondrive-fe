import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">이용약관</h1>
          <p className="text-muted-foreground">최종 수정일: {new Date().toLocaleDateString('ko-KR')}</p>
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">제1조 (목적)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 약관은 Joon Drive(이하 "회사")가 제공하는 클라우드 스토리지 서비스(이하 "서비스")의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제2조 (정의)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. "서비스"란 회사가 제공하는 클라우드 스토리지 및 파일 관리 서비스를 의미합니다.</p>
                <p>2. "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
                <p>3. "계정"이란 서비스 이용을 위해 이용자가 생성한 고유한 식별 정보를 의미합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제3조 (약관의 효력 및 변경)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
                <p>2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
                <p>3. 약관이 변경되는 경우 회사는 변경 사항을 시행일자 7일 전부터 공지합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제4조 (서비스의 제공 및 변경)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>파일 업로드, 다운로드, 저장 및 관리</li>
                  <li>파일 검색 및 공유 기능</li>
                  <li>계정 관리 및 설정</li>
                </ul>
                <p>2. 회사는 운영상, 기술상의 필요에 따라 제공하는 서비스의 내용을 변경할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제5조 (이용자의 의무)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>타인의 정보를 도용하거나 부정하게 사용하는 행위</li>
                  <li>법령에 위반되는 내용을 업로드하거나 공유하는 행위</li>
                  <li>서비스의 안정적 운영을 방해하는 행위</li>
                  <li>다른 이용자의 서비스 이용을 방해하는 행위</li>
                </ul>
                <p>2. 이용자는 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제6조 (개인정보 보호)</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 이용자의 개인정보 보호를 위하여 노력하며, 관련 법령 및 개인정보처리방침에 따라 
                이용자의 개인정보를 보호합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제7조 (면책조항)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 
                서비스 제공에 관한 책임이 면제됩니다.</p>
                <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                <p>3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">제8조 (준거법 및 관할법원)</h2>
              <p className="text-muted-foreground leading-relaxed">
                본 약관에 명시되지 않은 사항은 대한민국 관련 법령 및 상관례에 따르며, 
                서비스 이용과 관련하여 발생한 분쟁에 대하여는 회사의 본사 소재지를 관할하는 법원을 관할법원으로 합니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

