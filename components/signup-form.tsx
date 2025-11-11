"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Lock, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 이메일 인증 발송
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!email || !password || !confirmPassword) {
      toast.error("모든 필드를 입력해주세요.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.")
      return
    }

    if (password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    // 이메일 인증번호 발송 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setIsEmailSent(true)
    toast.success("이메일로 인증번호가 발송되었습니다.")
  }

  // 가입 완료
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode) {
      toast.error("인증번호를 입력해주세요.")
      return
    }

    setIsLoading(true)

    // 회원가입 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    toast.success("회원가입이 완료되었습니다! 🎉")

    // 폼 초기화
    setTimeout(() => {
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setVerificationCode("")
      setIsEmailSent(false)
    }, 2000)
  }

  return (
    <Card className="border-border shadow-lg">
      <CardContent className="pt-8 px-6 md:px-8 pb-8">
        <form onSubmit={isEmailSent ? handleSignup : handleSendVerification}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEmailSent}
                  className="pl-10 bg-input border-border focus:ring-primary h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="8자 이상 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isEmailSent}
                  className="pl-10 bg-input border-border focus:ring-primary h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                비밀번호 재입력
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isEmailSent}
                  className="pl-10 bg-input border-border focus:ring-primary h-11"
                  required
                />
              </div>
            </div>

            {!isEmailSent && (
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {"발송 중..."}
                  </>
                ) : (
                  "이메일 인증"
                )}
              </Button>
            )}

            {isEmailSent && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                  <Label htmlFor="verificationCode" className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {"인증번호"}
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="이메일로 받은 인증번호 입력"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="border-primary/50 focus-visible:ring-primary h-11"
                    required
                  />
                  <p className="text-xs text-muted-foreground pt-1">{email}(으)로 인증번호가 발송되었습니다.</p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {"가입 처리 중..."}
                    </>
                  ) : (
                    "가입 완료"
                  )}
                </Button>
              </>
            )}
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">{"이미 계정이 있으신가요? "}</span>
          <a href="/login" className="text-primary hover:underline font-medium">
            로그인
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
