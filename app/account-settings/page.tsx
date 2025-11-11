import { ChangePasswordForm } from "@/components/change-password-form"

export default function AccountSettingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center md:justify-center p-4 bg-background px-4 py-4">
      <div className="w-full max-w-md md:mt-0 mt-8">
        <ChangePasswordForm />
      </div>
    </div>
  )
}
