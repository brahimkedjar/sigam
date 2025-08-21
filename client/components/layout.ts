// =============================================================
// File: utils/layout.ts
// =============================================================
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const gridBackground = (zoom: number) =>
  `linear-gradient(to right, #eee 1px, transparent 1px), linear-gradient(to bottom, #eee 1px, transparent 1px)`;
