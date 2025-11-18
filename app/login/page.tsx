import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center md:justify-center flex-1 p-4 bg-background">
      <div className="w-full max-w-md md:mt-0 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">로그인</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
