import { useSyncExternalStore } from "react";
import {
  hydrateLocalBooleanSetting,
  readLocalBooleanSetting,
  writeLocalBooleanSetting,
} from "../../internal/durableLocalSetting";

const AD_BLOCK_KEY = "ad-block-enabled";
const FAST_LOADING_KEY = "fast-loading-enabled";
const CHANGE_EVENT = "ad-block-and-speed-change";

// Both enabled by default for an ad-free and instant playback experience
const DEFAULT_AD_BLOCK = true;
const DEFAULT_FAST_LOADING = true;

export function isAdBlockEnabled(): boolean {
  return readLocalBooleanSetting(AD_BLOCK_KEY, DEFAULT_AD_BLOCK);
}

export function isFastLoadingEnabled(): boolean {
  return readLocalBooleanSetting(FAST_LOADING_KEY, DEFAULT_FAST_LOADING);
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function setAdBlockEnabled(enabled: boolean): void {
  writeLocalBooleanSetting(AD_BLOCK_KEY, enabled, CHANGE_EVENT);
}

export function setFastLoadingEnabled(enabled: boolean): void {
  writeLocalBooleanSetting(FAST_LOADING_KEY, enabled, CHANGE_EVENT);
}

export function useAdBlockEnabled(): boolean {
  return useSyncExternalStore(subscribe, isAdBlockEnabled, () => DEFAULT_AD_BLOCK);
}

export function useFastLoadingEnabled(): boolean {
  return useSyncExternalStore(subscribe, isFastLoadingEnabled, () => DEFAULT_FAST_LOADING);
}

export async function hydrateAdBlockAndSpeed(): Promise<void> {
  await Promise.all([
    hydrateLocalBooleanSetting(AD_BLOCK_KEY, DEFAULT_AD_BLOCK, CHANGE_EVENT),
    hydrateLocalBooleanSetting(FAST_LOADING_KEY, DEFAULT_FAST_LOADING, CHANGE_EVENT),
  ]);
}
