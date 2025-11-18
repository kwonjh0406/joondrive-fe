import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center md:justify-center flex-1 p-4 bg-background">
      <div className="w-full max-w-md md:mt-0 mt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">회원가입</h1>
          <p className="text-muted-foreground">새로운 계정을 만들어보세요</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
