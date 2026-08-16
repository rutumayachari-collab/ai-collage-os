import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/app/pages/auth/ForgotPasswordPage";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Reset your NEXORA AI CAMPUSOS password" },
    ],
  }),
  component: ForgotPasswordPage,
});
