"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validatePassword, PASSWORD_MESSAGES } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          toast.error("인증 시간이 만료되었습니다. 다시 시도해주세요.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!email || !newPassword || !confirmPassword) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!validatePassword(newPassword)) {
      toast.error(PASSWORD_MESSAGES.INVALID_PASSWORD);
      return;
    }

    setIsLoading(true);

    // 이메일 인증번호 발송 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const expiresIn = 300;
    setTimeLeft(expiresIn);

    setIsLoading(false);
    setIsEmailSent(true);
    toast.success("이메일로 인증번호가 발송되었습니다.");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error("인증번호를 입력해주세요.");
      return;
    }

    if (timeLeft <= 0) {
      toast.error("인증 시간이 만료되었습니다. 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);

    // 비밀번호 재설정 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast.success("비밀번호 재설정 완료! 새로운 비밀번호로 로그인해주세요.");

    // 로그인 페이지로 이동
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  return (
    <Card className="border-border shadow-lg">
      <CardContent className="pt-6 md:pt-8 px-6 md:px-8 pb-8">
        <form
          onSubmit={isEmailSent ? handleResetPassword : handleSendVerification}
        >
          <div className="space-y-6">
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
                disabled={isEmailSent}
                className="bg-input border-border focus:ring-primary h-11"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-sm font-medium text-foreground"
              >
                새 비밀번호
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="8자 이상 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isEmailSent}
                className="bg-input border-border focus:ring-primary h-11"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                비밀번호 재입력
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isEmailSent}
                className="bg-input border-border focus:ring-primary h-11"
                autoComplete="new-password"
                required
              />
            </div>

            {!isEmailSent && (
              <Button
                type="submit"
                className="w-full h-12 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    발송 중...
                  </>
                ) : (
                  "이메일 인증"
                )}
              </Button>
            )}

            {isEmailSent && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                  <Label
                    htmlFor="verificationCode"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    인증번호
                    {timeLeft > 0 && (
                      <span className="ml-auto text-primary font-mono text-sm">
                        {formatTime(timeLeft)}
                      </span>
                    )}
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="이메일로 받은 인증번호 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-input border-border focus:ring-primary h-11"
                    required
                  />
                  <p className="text-xs text-muted-foreground pt-1">
                    {email}(으)로 인증번호가 발송되었습니다.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      재설정 중...
                    </>
                  ) : (
                    "비밀번호 재설정"
                  )}
                </Button>
              </>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">
            비밀번호가 기억나셨나요?{" "}
          </span>
          <a
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            로그인
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
