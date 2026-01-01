"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type CheatAction = () => void;
type CheatMap = Record<string, CheatAction>;

export default function CheatCodeListener() {
  const router = useRouter();
  const bufferRef = useRef("");

  const cheats: CheatMap = {
    admin: () => router.push("/admin"),
    user: () => router.push("/user"),
    auth: () => router.push("/auth"),
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const command = bufferRef.current.toLowerCase().trim();

        if (cheats[command]) {
          cheats[command]();
        }

        bufferRef.current = "";
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
