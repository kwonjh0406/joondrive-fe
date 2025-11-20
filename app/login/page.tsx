import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-100px)] p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 min-h-[4.5rem] flex flex-col justify-end">
          <h1 className="text-3xl font-bold text-foreground mb-2">로그인</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
