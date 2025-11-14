"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // form-data 대신 x-www-form-urlencoded로 보내야 Spring Security에서 인식됨
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);
      if (rememberMe) {
        formData.append("remember-me", "on");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          credentials: "include", // ✅ 세션 쿠키 유지 필수
          body: formData.toString(),
        }
      );

      if (res.ok) {
        toast.success("환영합니다!");
        router.push("/"); // ✅ 로그인 성공 시 홈으로 이동
      } else if (res.status === 401) {
        toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        toast.error("로그인 중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("서버와 연결할 수 없습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-lg">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-8 px-6 md:px-8 space-y-6">
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
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input border-border focus:ring-primary h-11"
              autoComplete="email"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border focus:ring-primary h-11"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
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
              className="text-sm text-primary hover:text-accent transition-colors"
            >
              비밀번호 찾기
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 mt-2"
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
              className="w-full border-border hover:bg-secondary text-secondary-foreground font-medium h-12 transition-all bg-transparent"
            >
              회원가입
            </Button>
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
