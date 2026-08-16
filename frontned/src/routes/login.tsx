import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/app/pages/auth/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — NEXORA AI CAMPUSOS" },
      { name: "description", content: "Sign in to NEXORA AI CAMPUSOS" },
    ],
  }),
  component: LoginPage,
});
