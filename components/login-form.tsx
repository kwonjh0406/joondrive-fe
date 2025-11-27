"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { validatePassword } from "@/lib/validation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;

const MESSAGES = {
  EMPTY_FIELDS: "이메일과 비밀번호를 입력해주세요.",
  INVALID_EMAIL: "올바른 이메일 형식을 입력해주세요.",
  INVALID_PASSWORD:
    "비밀번호는 8자 이상이며, 숫자, 영문, 특수문자를 각각 최소 1개 이상 포함해야 합니다.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  SERVER_ERROR: "로그인 중 문제가 발생했습니다.",
  NETWORK_ERROR: "서버와 연결할 수 없습니다.",
  SUCCESS: "환영합니다!",
} as const;

const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateForm = (email: string, password: string): string | null => {
  if (!email || !password) return MESSAGES.EMPTY_FIELDS;
  if (!validateEmail(email)) return MESSAGES.INVALID_EMAIL;
  if (!validatePassword(password)) return MESSAGES.INVALID_PASSWORD;
  return null;
};

const handleError = (status: number): string => {
  if (status === 401) return MESSAGES.INVALID_CREDENTIALS;
  return MESSAGES.SERVER_ERROR;
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const validationError = validateForm(email, password);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("email", email.trim());
      formData.append("password", password);
      if (rememberMe) formData.append("rememberMe", "on");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: formData.toString(),
      });

      if (res.ok) {
        toast.success(MESSAGES.SUCCESS);
        router.push("/");
        router.refresh();
      } else {
        const errorMsg = handleError(res.status);
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      setError(MESSAGES.NETWORK_ERROR);
      toast.error(MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-lg">
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="pt-8 px-6 md:px-8 space-y-6">
          {error && (
            <div
              role="alert"
              className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="bg-input border-border focus:ring-primary h-11"
              autoComplete="email"
              aria-invalid={!!error}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="bg-input border-border focus:ring-primary h-11"
              autoComplete="current-password"
              aria-invalid={!!error}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
                className="border-border data-[state=checked]:bg-primary"
              />
              <Label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                자동 로그인
              </Label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              비밀번호 찾기
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-2"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col px-6 md:px-8 pb-8 gap-0">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase py-2.5">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Link href="/signup" className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full hover:bg-primary/10 h-12"
            >
              회원가입
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
