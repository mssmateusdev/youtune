import { useSyncExternalStore } from "react";
import { getAppSetting, setAppSetting } from "../../internal/appSettings";

export interface AccentColorPreset {
  id: string;
  name: string;
  value: string;
}

export const ACCENT_COLOR_PRESETS: AccentColorPreset[] = [
  { id: "emerald", name: "Esmeralda", value: "#10B981" },
  { id: "cyan", name: "Ciano", value: "#06B6D4" },
  { id: "blue", name: "Azul Oceano", value: "#3B82F6" },
  { id: "purple", name: "Roxo Violeta", value: "#8B5CF6" },
  { id: "pink", name: "Rosa Choque", value: "#EC4899" },
  { id: "orange", name: "Laranja", value: "#F97316" },
  { id: "red", name: "Vermelho Carmim", value: "#EF4444" },
  { id: "amber", name: "Dourado", value: "#F59E0B" },
  { id: "lime", name: "Verde Limão", value: "#84CC16" },
];

export const DEFAULT_ACCENT_COLOR = "#10B981";

const STORAGE_KEY = "accent-color";
const CHANGE_EVENT = "accent-color-change";

export function isValidHexColor(color: unknown): color is string {
  return typeof color === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

export function readAccentColor(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValidHexColor(stored) ? stored : DEFAULT_ACCENT_COLOR;
  } catch {
    return DEFAULT_ACCENT_COLOR;
  }
}

export function applyAccentColor(color = readAccentColor()): void {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--color-primary", color);
    document.documentElement.style.setProperty("--color-ring", color);
  }
}

export function setAccentColor(color: string): void {
  if (!isValidHexColor(color)) return;
  try {
    localStorage.setItem(STORAGE_KEY, color);
  } catch {
    // local storage quota or private mode
  }
  applyAccentColor(color);
  window.dispatchEvent(new Event(CHANGE_EVENT));
  void setAppSetting(STORAGE_KEY, color);
}

export async function hydrateAccentColor(): Promise<void> {
  const stored = await getAppSetting<unknown>(STORAGE_KEY);
  const color = isValidHexColor(stored) ? stored : readAccentColor();

  try {
    localStorage.setItem(STORAGE_KEY, color);
  } catch {
    // ignore
  }

  applyAccentColor(color);
  window.dispatchEvent(new Event(CHANGE_EVENT));

  if (!isValidHexColor(stored)) {
    void setAppSetting(STORAGE_KEY, color);
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAccentColor(): string {
  return useSyncExternalStore(subscribe, readAccentColor, () => DEFAULT_ACCENT_COLOR);
}
