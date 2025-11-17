import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center p-4 bg-background px-4 py-4">
      <div className="w-full max-w-md md:mt-0 my-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">로그인</h1>
          <p className="text-muted-foreground">
            언제 어디서나 파일을 관리하세요
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
