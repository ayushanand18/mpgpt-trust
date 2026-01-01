import { LoginForm } from "@/components/auth/login-form"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
