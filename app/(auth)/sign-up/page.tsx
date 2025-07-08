// app/(auth)/sign-up/page.tsx
"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

const SignUpPage = () => {
  useEffect(() => {
    redirect("/sign-in");
  }, []);

  return null;
};

export default SignUpPage;
