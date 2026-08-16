import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/app/pages/auth/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Set a new password for your NEXORA AI CAMPUSOS account" },
    ],
  }),
  component: ResetPasswordPage,
});
