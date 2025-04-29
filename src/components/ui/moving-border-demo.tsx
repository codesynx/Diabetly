"use client";
import React from "react";
import { Button } from "@/components/ui/moving-border";

export function MovingBorderDemo() {
  return (
    <div>
      <Button
        borderRadius="1.75rem"
        className="bg-transparent dark:bg-slate-900 text-diabetly-blue dark:text-white border-neutral-200 dark:border-slate-800"
        duration={1500}
        borderClassName="bg-[radial-gradient(#4C9AFF_40%,transparent_60%)]"
        containerClassName="min-w-52 h-20"
      >
        Интерактивная кнопка
      </Button>
    </div>
  );
} 