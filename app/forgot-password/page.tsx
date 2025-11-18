import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center md:justify-center flex-1 bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="w-full max-w-md md:mt-0 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            비밀번호 찾기
          </h1>
          <p className="text-muted-foreground">
            가입하신 이메일로 인증번호를 보내드립니다
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
