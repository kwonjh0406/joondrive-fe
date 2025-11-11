"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }

    if (!currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요."
    }

    if (!newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요."
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "비밀번호는 8자 이상이어야 합니다."
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "새 비밀번호를 다시 입력해주세요."
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다."
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      toast.success("비밀번호가 성공적으로 변경되었습니다.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">비밀번호 변경</h1>
          <p className="text-muted-foreground">새로운 비밀번호로 변경하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-foreground">
              현재 비밀번호
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (errors.currentPassword) {
                    setErrors({ ...errors, currentPassword: "" })
                  }
                }}
                className={`pr-10 bg-background border-border ${errors.currentPassword ? "border-destructive" : ""}`}
                placeholder="현재 비밀번호 입력"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-sm text-destructive">{errors.currentPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-foreground">
              새 비밀번호
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: "" })
                  }
                }}
                className={`pr-10 bg-background border-border ${errors.newPassword ? "border-destructive" : ""}`}
                placeholder="새 비밀번호 입력 (8자 이상)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground">
              새 비밀번호 재입력
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: "" })
                  }
                }}
                className={`pr-10 bg-background border-border ${errors.confirmPassword ? "border-destructive" : ""}`}
                placeholder="새 비밀번호 재입력"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" className="w-full h-12 text-base font-medium">
            비밀번호 변경
          </Button>
        </form>
      </div>
    </div>
  )
}
