"use client";

import type { ReactNode } from "react";

import {
  isMonetizationReady,
  type AdSlotId,
} from "@/lib/monetization";

export type AdSlotProps = {
  slot: AdSlotId;
  children?: ReactNode;
  label?: string;
};

export function AdSlot({ slot, children, label = "Advertisement" }: AdSlotProps) {
  if (!isMonetizationReady() || !children) return null;

  return (
    <section
      aria-label={label}
      data-bobaks-ad-slot={slot}
      className="w-full"
    >
      {children}
    </section>
  );
}
