import { ChangePasswordForm } from "@/components/change-password-form"

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] md:min-h-[calc(100vh-100px)] p-4 bg-background">
      <div className="w-full max-w-md">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
