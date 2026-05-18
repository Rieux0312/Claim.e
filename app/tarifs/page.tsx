"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TarifsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/#tarifs");
  }, [router]);
  return null;
}
