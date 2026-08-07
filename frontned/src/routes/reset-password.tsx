import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/app/pages/auth/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — AI-CollegeOS" },
      { name: "description", content: "Set a new password for your AI-CollegeOS account" },
    ],
  }),
  component: ResetPasswordPage,
});
