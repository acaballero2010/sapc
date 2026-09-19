"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { RefreshCw } from "lucide-react";

export default function DashboardIndexPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === "guidance_counselor") {
        router.replace("/dashboard/guidance");
      } else if (user?.role === "teacher") {
        router.replace("/dashboard/teacher");
      } else if (user?.role === "student") {
        router.replace("/dashboard/student");
      } else if (user?.role === "parent") {
        router.replace("/dashboard/parent");
      } else if (user?.role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/guidance");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-300">
      <RefreshCw className="h-10 w-10 animate-spin text-amber-400" />
      <p className="text-base font-bold text-white">Navigating to your SAPC role dashboard...</p>
    </div>
  );
}
