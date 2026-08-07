import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/app/pages/auth/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — AI-CollegeOS" },
      { name: "description", content: "Sign in to AI-CollegeOS" },
    ],
  }),
  component: LoginPage,
});
