import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">개인정보처리방침</h1>
          <p className="text-muted-foreground">최종 수정일: {new Date().toLocaleDateString('ko-KR')}</p>
        </div>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 처리 목적</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Joon Drive(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 
                다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 
                개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">가. 서비스 제공</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                  <li>파일 저장, 관리, 공유 등 서비스 제공</li>
                  <li>서비스 이용 기록 및 접속 빈도 파악을 통한 서비스 개선</li>
                </ul>
                <p className="mt-4"><strong className="text-foreground">나. 민원사무 처리</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지</li>
                  <li>처리결과 통보</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 
                개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                <p>2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 
                  해당 수사·조사 종료 시까지)</li>
                  <li>서비스 이용 기록: 3년 (통신비밀보호법)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. 처리하는 개인정보의 항목</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                <p><strong className="text-foreground">가. 회원 가입 및 관리</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>필수항목: 이메일 주소, 비밀번호</li>
                  <li>자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 
                정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 
                개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. 개인정보처리의 위탁</h2>
              <p className="text-muted-foreground leading-relaxed">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 
                기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 
                계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. 정보주체의 권리·의무 및 그 행사방법</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>정보주체는 다음과 같은 권리를 행사할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보 열람요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제요구</li>
                  <li>처리정지 요구</li>
                </ul>
                <p className="mt-4">위 권리 행사는 회사에 대해 개인정보 보호법 시행령 제41조 제1항에 따라 
                서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. 개인정보의 파기</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
                지체없이 해당 개인정보를 파기합니다.</p>
                <p>2. 개인정보 파기의 절차 및 방법은 다음과 같습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>파기 절차: 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
                  <li>파기 방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. 개인정보 보호책임자</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 
                불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                <div className="bg-card p-4 rounded-lg mt-4">
                  <p><strong className="text-foreground">개인정보 보호책임자</strong></p>
                  <p>이메일: privacy@joondrive.com</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. 개인정보의 안전성 확보 조치</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. 개인정보처리방침 변경</h2>
              <p className="text-muted-foreground leading-relaxed">
                이 개인정보처리방침은 2024년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 
                삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

