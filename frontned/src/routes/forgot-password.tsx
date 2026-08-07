import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/app/pages/auth/ForgotPasswordPage";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — AI-CollegeOS" },
      { name: "description", content: "Reset your AI-CollegeOS password" },
    ],
  }),
  component: ForgotPasswordPage,
});
