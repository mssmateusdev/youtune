import { useSyncExternalStore } from "react";
import {
  hydrateLocalBooleanSetting,
  readLocalBooleanSetting,
  writeLocalBooleanSetting,
} from "../../internal/durableLocalSetting";

/**
 * Which optional buttons the title bar carries.
 *
 * All on by default — the toolbar as it has always been — and each is only about *visibility*.
 * Hiding the Discord or Last.fm button does not turn the integration off; that stays where it
 * was, in its own setting, so a hidden button can never silently stop scrobbling.
 */
export type ToolbarItem = "notifications" | "downloads" | "discord" | "lastfm" | "ytmusic";

const STORAGE_KEYS: Record<ToolbarItem, string> = {
  notifications: "toolbar-notifications-visible",
  downloads: "toolbar-downloads-visible",
  discord: "toolbar-discord-visible",
  lastfm: "toolbar-lastfm-visible",
  ytmusic: "toolbar-ytmusic-visible",
};

/** Label and blurb for the settings rows, in the order they sit in the toolbar. */
export const TOOLBAR_ITEMS: Array<{
  id: ToolbarItem;
  label: string;
  description: string;
}> = [
  {
    id: "notifications",
    label: "Notificações",
    description: "Novos lançamentos de artistas que você segue, com contagem de não lidos.",
  },
  {
    id: "downloads",
    label: "Downloads",
    description: "Progresso de músicas salvas para ouvir offline e itens armazenados.",
  },
  {
    id: "discord",
    label: "Presença no Discord",
    description: "Atalho para compartilhar o que está ouvindo. Ocultar mantém o status atual.",
  },
  {
    id: "lastfm",
    label: "Scrobbling Last.fm",
    description: "Atalho para scrobbling. Ocultar mantém o status atual.",
  },
  {
    id: "ytmusic",
    label: "Histórico YouTube Music",
    description: "Atalho para registrar reproduções no YouTube. Ocultar mantém o status atual.",
  },
];

const CHANGE_EVENT = "toolbar-items-change";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  // Another window (the mini player) writes the same keys.
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function readToolbarItemVisible(item: ToolbarItem): boolean {
  return readLocalBooleanSetting(STORAGE_KEYS[item], true);
}

export function setToolbarItemVisible(item: ToolbarItem, visible: boolean) {
  writeLocalBooleanSetting(STORAGE_KEYS[item], visible, CHANGE_EVENT);
}

export function useToolbarItemVisible(item: ToolbarItem): boolean {
  return useSyncExternalStore(subscribe, () => readToolbarItemVisible(item), () => true);
}

export async function hydrateToolbarItemSettings() {
  await Promise.all(
    Object.values(STORAGE_KEYS).map((key) => hydrateLocalBooleanSetting(key, true, CHANGE_EVENT)),
  );
}
