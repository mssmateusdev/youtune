import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from "react";
import { Switch } from "@/components/motion/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { RangeSlider } from "@/components/motion/range-slider";
import {
  activeEqualizerPreset,
  EQUALIZER_BANDS_HZ,
  EQUALIZER_MAX_DB,
  EQUALIZER_PRESETS,
  isEqualizerFlat,
  setEqualizer,
  setEqualizerEnabled,
  useEqualizer,
  useEqualizerEnabled,
} from "../settings/equalizer";
import {
  MAX_CROSSFADE_SEC,
  setCrossfadeSec,
  setGaplessEnabled,
  useCrossfadeSec,
  useGaplessEnabled,
} from "../settings/playbackTransitions";
import {
  setSessionRestoreEnabled,
  useSessionRestoreEnabled,
} from "../settings/sessionRestore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
import {
  BugIcon,
  CheckIcon,
  DownloadIcon,
  FolderAddIcon,
  FolderIcon,
  FolderOpenIcon,
  KeyIcon,
  LastFmIcon,
  LogFileIcon,
  LogoutIcon,
  LyricsIcon,
  PaletteIcon,
  PlayIcon,
  QueuePanelIcon,
  RefreshIcon,
  SettingsIcon,
  SpeedIcon,
  TrashIcon,
  UserIcon,
} from "@/ui/icons";
import {
  setAdBlockEnabled,
  setFastLoadingEnabled,
  useAdBlockEnabled,
  useFastLoadingEnabled,
} from "../settings/adBlockAndSpeed";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from "../settings/theme";
import { invoke } from "@tauri-apps/api/core";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import {
  checkForUpdates,
  getUpdateFailureMessage,
  getInstalledVersion,
  installUpdate,
  type UpdateInfo,
  type UpdateInstallProgress,
} from "../../internal/updateChecker";
import {
  clearCache,
  DEFAULT_CACHE_SIZE_GB,
  getCacheStats,
  setCacheMaxBytes,
  type CacheStats,
} from "../../internal/cache";
import type { LibraryController, LibraryState } from "../../player/LibraryController";
import {
  getAutostartEnabled,
  setAutostartEnabled,
} from "../settings/autostart";
import {
  setCompactPlayerBar,
  setExtraPlayerControlsAlwaysVisible,
  useCompactPlayerBar,
  useExtraPlayerControlsAlwaysVisible,
} from "../settings/playerControls";
import {
  RENDER_EFFECTS,
  setEffectDisabled,
  setPotatoPcMode,
  useEffectDisabled,
  usePotatoPcMode,
} from "../settings/renderEffects";
import { setMadeForYouVisible, useMadeForYouVisible } from "../settings/homeSections";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { ExternalLinkButton } from "../components/ExternalLinkButton";
import {
  AUTO_LYRICS_SOURCE,
  setPreferredLyricsSourceId,
  usePreferredLyricsSourceId,
} from "../../internal/lyricsSourcePreference";
import { LYRICS_SOURCES } from "../../datasource/youtube/lyricsSources";
import {
  LYRICS_FONT_SCALES,
  setLyricsFontScale,
  useLyricsFontScale,
} from "../settings/lyricsFontScale";
import {
  TRANSLATION_LANGUAGES,
  TRANSLATION_OFF,
  getLanguageLabel,
  setLyricsTranslationLang,
  useLyricsTranslationLang,
} from "../settings/lyricsTranslation";
import {
  setToolbarItemVisible,
  TOOLBAR_ITEMS,
  useToolbarItemVisible,
} from "../settings/toolbarItems";
import {
  setForceWindowControls,
  setNativeWindowControls,
  setWindowsStyleWindowControls,
  useForceWindowControls,
  useNativeWindowControls,
  useWindowsStyleWindowControls,
} from "../settings/windowControls";
import {
  resetMiniPlayerPosition,
  setMiniPlayerEnabled,
  setMiniPlayerHoverAction,
  useMiniPlayerEnabled,
  useMiniPlayerHoverAction,
  type MiniPlayerHoverAction,
} from "../settings/miniPlayer";
import {
  setMainWindowGeometryPersistenceEnabled,
  useMainWindowGeometryPersistenceEnabled,
} from "../settings/mainWindowGeometry";
import { setMinimizeToTray, useMinimizeToTray } from "../settings/tray";
import {
  setLinuxMediaSession,
  useLinuxMediaSession,
} from "../settings/mediaSession";
import {
  SIDEBAR_MODES,
  setSidebarMode,
  useSidebarMode,
  type SidebarMode,
} from "../settings/sidebarMode";
import {
  setAuthenticatedStreaming,
  setYouTubeScrobbling,
  useAuthenticatedStreaming,
  useYouTubeScrobbling,
} from "../settings/youtubeAccount";
import {
  AUDIO_ENGINE_MODES,
  setAudioEngineMode,
  useAudioEngineMode,
  type AudioEngineMode,
} from "../settings/audioEngine";
import {
  listOutputDevices,
  setOutputDevice,
  SYSTEM_DEFAULT_DEVICE,
  useOutputDevice,
  type OutputDevice,
} from "../settings/audioOutputDevice";
import {
  captureKeyboardShortcut,
  formatKeyboardShortcut,
  KEYBOARD_SHORTCUT_ACTIONS,
  resetKeyboardShortcut,
  resetKeyboardShortcuts,
  setKeyboardShortcut,
  useKeyboardShortcuts,
  type KeyboardShortcutAction,
} from "../settings/keyboardShortcuts";
import {
  addLocalPlaylistPath,
  createLocalPlaylist,
  deleteLocalPlaylist,
  getLocalPlaylists,
  removeLocalPlaylistPath,
  subscribeToLocalPlaylists,
} from "../../player/localPlaylists";
import { LastFmService, type LastFmAuthStart, type LastFmSessionStatus } from "../../player/LastFm";
import { DiscordRpcService } from "../../player/DiscordRPC";
import { useDiscordPresenceEnabled } from "../settings/discord";
import {
  setLastFmScrobblingEnabled,
  useLastFmScrobblingEnabled,
} from "../settings/lastfm";
import { isLinux, isTilingWindowManager, subscribeTilingWindowManager } from "../platform";
import { ACCENT_COLOR_PRESETS, setAccentColor, useAccentColor } from "../settings/accentColor";
import { AccountAvatar, AccountSwitcher, AddGoogleAccountButton, GoogleAccountSwitcher } from "../components/AccountSwitcher";
import {
  AUDIO_QUALITY_LABELS,
  setDownloadQuality,
  setStreamingQuality,
  useDownloadQuality,
  useStreamingQuality,
  type AudioQuality,
} from "../../internal/audioQuality";
import {
  getOfflineMaxBytes,
  removeAllDownloads,
  setOfflineMaxBytes,
  useOfflineState,
} from "../../player/offlineStore";




/*
 * Label + description pair used by every settings row.
 *
 * `flex flex-col` is the load-bearing part: both children are inline elements, so without a
 * block/flex wrapper the description runs straight on from the label ("Scrobble playsSend
 * now playing updates...") — the CSS Modules used to stack them and the Tailwind migration
 * dropped it.
 */
const SETTING_LABEL =
  "flex flex-col gap-0.5 text-sm text-muted-foreground [&>strong]:text-sm [&>strong]:font-medium [&>strong]:text-foreground";

/** Section card. One shape for every group so the page reads as a single system. */
const SETTINGS_CARD = "flex flex-col gap-5 rounded-2xl bg-card/60 border border-border/40 p-6";

/**
 * How long ago YouTube last answered as this account, in words.
 *
 * Deliberately visible rather than internal: with no telemetry, this one line is what turns
 * "liking songs stopped working" into a report somebody can act on.
 */
function formatSessionAge(confirmedAt: number | null): string {
  if (confirmedAt === null) return "ainda não";
  const minutes = Math.floor((Date.now() - confirmedAt) / 60_000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} minuto${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  return `há ${hours} hora${hours === 1 ? "" : "s"}`;
}

/**
 * Text field. Preflight strips the browser's default input chrome, and these two fields were
 * left bare by the CSS Modules migration — they rendered as invisible text on the card.
 */
const SETTINGS_FIELD =
  "min-w-0 rounded-lg bg-background px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring/60";

/**
 * The ten-band equaliser.
 *
 * A component of its own rather than a run of `SettingRow`s because the bands are one control,
 * not eleven: they share a scale, a reset and a set of presets, and reading one slider only
 * means anything next to its neighbours.
 *
 * Sliders are horizontal, stacked. The usual picture of an equaliser is vertical, but that would
 * mean a second slider component built to be rotated, and the frequency and the gain read more
 * clearly written out than inferred from a bar's height.
 *
 * The switch is a bypass, not a reset — it never touches the stored curve, only whether Rust is
 * currently told to apply it. See `setEqualizerEnabled`.
 */
function EqualizerSettings({ engineMode }: { engineMode: AudioEngineMode }) {
  const equalizer = useEqualizer();
  const enabled = useEqualizerEnabled();
  // Only the Rust engine has the samples. A track that fell back to the YouTube player plays
  // unequalised no matter what these say, which the note below is there to admit.
  const available = engineMode === "rust";
  const flat = isEqualizerFlat(equalizer);
  const labelId = useId();

  const setBand = (index: number, gain: number) => {
    const bandsDb = equalizer.bandsDb.slice();
    bandsDb[index] = gain;
    setEqualizer({ ...equalizer, bandsDb });
  };

  const activePreset = activeEqualizerPreset(equalizer);

  return (
    <div className={cn("flex flex-col gap-3 pt-1", !available && "opacity-50")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span id={labelId} className="text-sm font-medium text-foreground">
            Equalizador
          </span>
          <span className="text-xs text-muted-foreground">
            {available
              ? enabled
                ? flat
                  ? "Plano"
                  : `${equalizer.preampDb > 0 ? "+" : ""}${equalizer.preampDb} dB pré-amp`
                : "Desligado"
              : "Requer o método de reprodução Rust"}
          </span>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={setEqualizerEnabled}
          disabled={!available}
          aria-labelledby={labelId}
        />
      </div>

      {/*
        * Dimmed, not disabled: the curve is still worth shaping while off, the same way a
        * hardware EQ's sliders keep moving with the bypass switch flipped — it is what makes
        * flipping it back on show the shape you already built instead of the flat one it was
        * silently holding underneath.
        */}
      <div className={cn("flex flex-col gap-3", !enabled && "opacity-60")}>
        <div className="flex flex-wrap gap-2">
          {EQUALIZER_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              disabled={!available}
              onClick={() => setEqualizer(preset.settings)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                activePreset?.name === preset.name
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-card",
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <EqualizerBand
          label="Pré-amp"
          value={equalizer.preampDb}
          disabled={!available}
          onChange={(preampDb) => setEqualizer({ ...equalizer, preampDb })}
        />

        <div className="h-px bg-border" />

        {EQUALIZER_BANDS_HZ.map((hz, index) => (
          <EqualizerBand
            key={hz}
            label={hz >= 1000 ? `${hz / 1000}k` : String(hz)}
            value={equalizer.bandsDb[index]}
            disabled={!available}
            onChange={(gain) => setBand(index, gain)}
          />
        ))}
      </div>

      <p className="px-1 text-xs text-muted-foreground">
        Aplica imediatamente à faixa em reprodução. Um limitador atua após as bandas, evitando distorção por clipagem — reduza o pré-amp para ouvir a diferença.
      </p>
    </div>
  );
}

/**
 * Which sound card the Rust engine writes to.
 *
 * Only the Rust engine opens one itself — the IFrame and native paths play through the webview
 * and follow whatever the OS default routes to, same as any other browser tab.
 */
function OutputDeviceSetting({ engineMode }: { engineMode: AudioEngineMode }) {
  const selected = useOutputDevice();
  const [devices, setDevices] = useState<OutputDevice[]>([]);
  const available = engineMode === "rust";

  useEffect(() => {
    let cancelled = false;
    listOutputDevices()
      .then((found) => {
        if (!cancelled) setDevices(found);
      })
      // The row still works with an empty list — it just offers nothing but "System default".
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SettingRow
      title="Dispositivo de saída"
      description="Placa de som onde o motor Rust reproduz o áudio."
      disabled={!available}
    >
      {(labelId) => (
        <Select
          className="w-52"
          value={selected ?? SYSTEM_DEFAULT_DEVICE}
          onValueChange={(value) => {
            setOutputDevice(value === SYSTEM_DEFAULT_DEVICE ? null : value);
          }}
        >
          <SelectTrigger aria-labelledby={labelId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SYSTEM_DEFAULT_DEVICE}>Padrão do sistema</SelectItem>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                {device.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </SettingRow>
  );
}

function EqualizerBand({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {label}
      </span>
      <RangeSlider
        className="min-w-0 flex-1"
        value={value}
        min={-EQUALIZER_MAX_DB}
        max={EQUALIZER_MAX_DB}
        step={1}
        showTicks={false}
        disabled={disabled}
        onValueChange={onChange}
        aria-label={`${label} gain in decibels`}
      />
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {value > 0 ? "+" : ""}
        {value} dB
      </span>
    </div>
  );
}

/**
 * One settings row: label and description on the left, control on the right.
 *
 * The wrapper is a `div`, not a `label`, because the controls are now buttons
 * (`role="switch"`, `role="listbox"`) rather than native inputs — a button inside a label
 * gets its activation swallowed by the label's own click forwarding. The association is made
 * explicitly instead, via `aria-labelledby` on the control, so screen readers still announce
 * the row title when the control takes focus.
 */
function SettingRow({
  title,
  description,
  disabled,
  children,
}: {
  title: string;
  description?: ReactNode;
  disabled?: boolean;
  /** Receives the id of the row title so the control can point `aria-labelledby` at it. */
  children: (labelId: string) => ReactNode;
}) {
  const labelId = useId();
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-6 py-2.5",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <span className="flex min-w-0 flex-col gap-0.5">
        <span id={labelId} className="text-sm font-medium text-foreground">
          {title}
        </span>
        {description ? (
          <span className="text-sm text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <span className="flex shrink-0 items-center gap-2 pt-0.5">{children(labelId)}</span>
    </div>
  );
}

/**
 * The Motion & performance card's contents.
 *
 * One switch for the blunt version, and a Manage disclosure for the eleven behind it. The
 * individual switches are a debugging instrument — you flip one, watch the GPU, flip it back —
 * and eleven of them sitting open in Settings read as eleven decisions the user has to make.
 */
function PotatoPcSettings() {
  const potatoPcMode = usePotatoPcMode();
  const [isManaging, setIsManaging] = useState(false);
  const panelId = useId();

  return (
    <>
      <SettingRow
        title="Modo Batata (PC Fraco)"
        description="Desativa animações, desfoques, sombras e arte ambiente, alternando para superfícies opacas. 'Gerenciar' permite ajustar um por um."
      >
        {(labelId) => (
          <>
            <button
              type="button"
              onClick={() => setIsManaging((current) => !current)}
              aria-expanded={isManaging}
              aria-controls={panelId}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              {isManaging ? "Concluído" : "Gerenciar"}
            </button>
            <Switch
              checked={potatoPcMode}
              onCheckedChange={setPotatoPcMode}
              aria-labelledby={labelId}
            />
          </>
        )}
      </SettingRow>

      {isManaging && (
        <div id={panelId} className="flex flex-col">
          <p className="pb-1 pt-2 text-sm text-muted-foreground">
            Um botão por efeito. Desative um de cada vez para descobrir o que consome desempenho no seu computador.
          </p>
          {RENDER_EFFECTS.map((effect) => (
            <RenderEffectToggle key={effect.id} effect={effect} />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Same reason as `ToolbarItemToggle`: one subscription per row.
 *
 * The switch reads as "effect on", the store as "effect disabled" — inverted here rather than
 * in the store, because the attribute the CSS matches on is a list of what is *off*, and an
 * empty list has to mean "nothing disabled" for a fresh install to look normal.
 */
function RenderEffectToggle({ effect }: { effect: (typeof RENDER_EFFECTS)[number] }) {
  const disabled = useEffectDisabled(effect.id);
  return (
    <SettingToggle
      title={effect.label}
      description={effect.description}
      checked={!disabled}
      onCheckedChange={(checked) => setEffectDisabled(effect.id, !checked)}
    />
  );
}

/** Its own component so each row can hold its own subscription rather than one per item here. */
function ToolbarItemToggle({ item }: { item: (typeof TOOLBAR_ITEMS)[number] }) {
  const visible = useToolbarItemVisible(item.id);
  return (
    <SettingToggle
      title={item.label}
      description={item.description}
      checked={visible}
      onCheckedChange={(checked) => setToolbarItemVisible(item.id, checked)}
    />
  );
}

/** The common case: a row whose only control is a switch. */
function SettingToggle({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  title: string;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <SettingRow title={title} description={description} disabled={disabled}>
      {(labelId) => (
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-labelledby={labelId}
        />
      )}
    </SettingRow>
  );
}

/**
 * Header for a settings card: icon, title and description on the left, status on the right.
 *
 * The four cards each rolled their own, and three of them put the status chip immediately
 * after the description inside a plain `flex gap-3` — so "Signed out" read as part of the
 * sentence rather than as the card's state. `justify-between` plus a `min-w-0 flex-1` text
 * column is what actually pins it to the right edge and truncates instead of overflowing.
 */
function SettingsCardHeader({
  title,
  titleId,
  description,
  icon,
  status,
}: {
  title: string;
  titleId: string;
  description: ReactNode;
  icon?: ReactNode;
  /** Right-aligned state, e.g. "Connected". */
  status?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {icon ? (
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {status ? <span className="shrink-0 text-sm">{status}</span> : null}
    </div>
  );
}

/** Quiet outbound links in the page header. */
type SettingsTab = "about" | "appearance" | "playback" | "system" | "shortcuts" | "window";

type WindowControlStyle = "macos" | "windows" | "native";

const SETTINGS_TABS: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof UserIcon;
}> = [
  { id: "about", label: "Conta", description: "Login, integrações, atualizações", icon: UserIcon },
  { id: "appearance", label: "Aparência", description: "Tema e efeitos visuais", icon: PaletteIcon },
  {
    id: "playback",
    label: "Reprodução",
    description: "Transições e sessão",
    icon: PlayIcon,
  },
  { id: "system", label: "Biblioteca", description: "Cache e arquivos locais", icon: FolderIcon },
  { id: "window", label: "Janela", description: "Interface e mini player", icon: QueuePanelIcon },
  { id: "shortcuts", label: "Atalhos", description: "Teclas de atalho", icon: KeyIcon },
];

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  hint: string;
  swatch: string;
}> = [
  { value: "light", label: "Claro", hint: "Sempre claro", swatch: "bg-white" },
  { value: "dark", label: "Escuro", hint: "Sempre escuro", swatch: "bg-neutral-900" },
  {
    value: "system",
    label: "Sistema",
    hint: "Seguir o sistema",
    swatch: "bg-linear-to-br from-white to-neutral-900",
  },
];

interface SettingsPageProps {
  libraryController: LibraryController;
  libraryState: LibraryState;
  onRestartOnboarding: () => void;
  onSignIn: () => Promise<void>;
  onDeleteAllAppData: () => Promise<void>;
}

export function SettingsPage({
  libraryController,
  libraryState,
  onRestartOnboarding,
  onSignIn,
  onDeleteAllAppData,
}: SettingsPageProps) {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cacheSizeGb, setCacheSizeGb] = useState(DEFAULT_CACHE_SIZE_GB.toString());
  const [cacheBusy, setCacheBusy] = useState(false);
  const [cacheError, setCacheError] = useState<string | null>(null);
  const [installedVersion, setInstalledVersion] = useState<string | null>(null);
  const [updateResult, setUpdateResult] = useState<UpdateInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "installing" | "current" | "error"
  >("idle");
  const [updateProgress, setUpdateProgress] = useState<UpdateInstallProgress | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [autostartEnabled, setAutostartEnabledState] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(true);
  const [autostartError, setAutostartError] = useState<string | null>(null);
  const [logOpening, setLogOpening] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [miniPlayerResetting, setMiniPlayerResetting] = useState(false);
  const [resetSettingsConfirming, setResetSettingsConfirming] = useState(false);
  const [resetSettingsBusy, setResetSettingsBusy] = useState(false);
  const [resetSettingsError, setResetSettingsError] = useState<string | null>(null);
  const [localPlaylistName, setLocalPlaylistName] = useState("");
  const [localPlaylistPathInputs, setLocalPlaylistPathInputs] = useState<Record<string, string>>({});
  const [localPlaylistError, setLocalPlaylistError] = useState<string | null>(null);
  const [localPlaylistBrowsingId, setLocalPlaylistBrowsingId] = useState<string | null>(null);
  const [lastFmSession, setLastFmSession] = useState<LastFmSessionStatus | null>(null);
  const [lastFmAuth, setLastFmAuth] = useState<LastFmAuthStart | null>(null);
  const [lastFmBusy, setLastFmBusy] = useState(false);
  const [lastFmError, setLastFmError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("about");
  const themePreference = useThemePreference();
  const accentColor = useAccentColor();
  const adBlockEnabled = useAdBlockEnabled();
  const fastLoadingEnabled = useFastLoadingEnabled();
  const [listeningShortcut, setListeningShortcut] = useState<KeyboardShortcutAction | null>(null);
  const keyboardShortcuts = useKeyboardShortcuts();
  const miniPlayerEnabled = useMiniPlayerEnabled();
  const miniPlayerHoverAction = useMiniPlayerHoverAction();
  const sidebarMode = useSidebarMode();
  const audioEngineMode = useAudioEngineMode();
  const authenticatedStreaming = useAuthenticatedStreaming();
  const youtubeScrobbling = useYouTubeScrobbling();
  const preferredLyricsSource = usePreferredLyricsSourceId();
  const lyricsFontScale = useLyricsFontScale();
  const lyricsTranslationLang = useLyricsTranslationLang();
  const madeForYouVisible = useMadeForYouVisible();
  const crossfadeSec = useCrossfadeSec();
  const gaplessEnabled = useGaplessEnabled();
  const sessionRestoreEnabled = useSessionRestoreEnabled();
  const extraPlayerControlsAlwaysVisible = useExtraPlayerControlsAlwaysVisible();
  const compactPlayerBar = useCompactPlayerBar();
  const windowsStyleWindowControls = useWindowsStyleWindowControls();
  const nativeWindowControls = useNativeWindowControls();
  const forceWindowControls = useForceWindowControls();
  const tilingWindowManager = useSyncExternalStore(
    subscribeTilingWindowManager,
    isTilingWindowManager,
    () => false,
  );
  // "Native" and "Windows-style" used to be two separate switches, one of which only meant
  // anything when the other was off. Collapsing them into one three-way pick removes the
  // combination that did nothing (native + windows-style both on).
  const windowControlStyle: WindowControlStyle = nativeWindowControls
    ? "native"
    : windowsStyleWindowControls ? "windows" : "macos";
  const handleWindowControlStyleChange = (style: WindowControlStyle) => {
    const goingNative = style === "native";
    if (goingNative !== nativeWindowControls) {
      setNativeWindowControls(goingNative);
      // GTK decorations don't reliably flip live on Linux, so this style needs a fresh window.
      if (isLinux) void relaunch().catch(() => window.location.reload());
    }
    if (!goingNative) setWindowsStyleWindowControls(style === "windows");
  };
  const mainWindowGeometryPersistenceEnabled = useMainWindowGeometryPersistenceEnabled();
  const minimizeToTray = useMinimizeToTray();
  const linuxMediaSession = useLinuxMediaSession();
  const offlineState = useOfflineState();
  const streamingQuality = useStreamingQuality();
  const downloadQuality = useDownloadQuality();
  const [offlineMaxGb, setOfflineMaxGb] = useState(
    () => getOfflineMaxBytes() / 1024 ** 3,
  );
  const [clearingDownloads, setClearingDownloads] = useState(false);
  const lastFmScrobblingEnabled = useLastFmScrobblingEnabled();
  const discordPresenceEnabled = useDiscordPresenceEnabled();
  const localPlaylists = useSyncExternalStore(
    subscribeToLocalPlaylists,
    getLocalPlaylists,
    getLocalPlaylists,
  );
  const account = libraryState.library?.account;
  // Confirmed by YouTube rather than inferred from cached data — see LibraryState.
  const isSignedIn = libraryState.status === "ready"
    && account
    && libraryState.sessionConfirmedAt !== null;
  const authBusy = libraryState.status === "restoring"
    || libraryState.status === "authorizing"
    || libraryState.status === "loading";

  useEffect(() => {
    let active = true;
    void getCacheStats()
      .then((stats) => {
        if (!active) return;
        setCacheStats(stats);
        setCacheSizeGb((stats.maxBytes / 1024 ** 3).toString());
      })
      .catch(() => {
        if (active) setCacheError("Unable to load cache settings.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getInstalledVersion()
      .then((version) => {
        if (active) setInstalledVersion(version);
      })
      .catch(() => {
        if (active) setInstalledVersion("Unknown");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void LastFmService.getSession()
      .then((session) => {
        if (active) setLastFmSession(session);
      })
      .catch((error) => {
        if (active) {
          setLastFmError(error instanceof Error ? error.message : "Unable to load Last.fm connection.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!resetSettingsConfirming) return undefined;
    const timeout = window.setTimeout(() => setResetSettingsConfirming(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [resetSettingsConfirming]);

  const handleCheckForUpdates = async () => {
    setUpdateStatus("checking");
    setUpdateResult(null);
    setUpdateError(null);
    setUpdateProgress(null);
    try {
      const update = await checkForUpdates();
      setUpdateResult(update);
      setUpdateStatus(update ? "idle" : "current");
    } catch (error) {
      setUpdateError(getUpdateFailureMessage(error));
      setUpdateStatus("error");
    }
  };

  const handleInstallUpdate = async () => {
    if (!updateResult) return;
    setUpdateStatus("installing");
    setUpdateError(null);
    try {
      await installUpdate(updateResult, setUpdateProgress);
    } catch {
      setUpdateError("Unable to install the update. You can download it from GitHub.");
      setUpdateStatus("error");
    }
  };

  useEffect(() => {
    let active = true;
    void getAutostartEnabled()
      .then((enabled) => {
        if (active) setAutostartEnabledState(enabled);
      })
      .catch(() => {
        if (active) setAutostartError("Unable to load the startup setting.");
      })
      .finally(() => {
        if (active) setAutostartLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAutostartChange = async (enabled: boolean) => {
    setAutostartLoading(true);
    setAutostartError(null);
    try {
      await setAutostartEnabled(enabled);
      setAutostartEnabledState(enabled);
    } catch {
      setAutostartError("Unable to update the startup setting.");
    } finally {
      setAutostartLoading(false);
    }
  };

  const handleOpenLog = async () => {
    setLogOpening(true);
    setLogError(null);
    try {
      await invoke("open_current_log");
    } catch {
      setLogError("Unable to open the log file.");
    } finally {
      setLogOpening(false);
    }
  };

  const handleResetMiniPlayerPosition = async () => {
    setMiniPlayerResetting(true);
    try {
      await resetMiniPlayerPosition();
    } finally {
      setMiniPlayerResetting(false);
    }
  };

  const saveCacheSize = async () => {
    const sizeGb = Number(cacheSizeGb);
    if (!Number.isFinite(sizeGb) || sizeGb < 0.25 || sizeGb > 64) {
      setCacheError("Cache size must be between 0.25 GB and 64 GB.");
      return;
    }

    setCacheBusy(true);
    setCacheError(null);
    try {
      setCacheStats(await setCacheMaxBytes(Math.round(sizeGb * 1024 ** 3)));
    } catch {
      setCacheError("Unable to save the cache size.");
    } finally {
      setCacheBusy(false);
    }
  };

  const handleClearCache = async () => {
    setCacheBusy(true);
    setCacheError(null);
    try {
      setCacheStats(await clearCache());
    } catch {
      setCacheError("Unable to clear cached content.");
    } finally {
      setCacheBusy(false);
    }
  };

  const handleClearAllSettings = async () => {
    setResetSettingsError(null);
    if (!resetSettingsConfirming) {
      setResetSettingsConfirming(true);
      return;
    }

    setResetSettingsBusy(true);
    try {
      await onDeleteAllAppData();
      await relaunch().catch(() => {
        window.location.reload();
      });
    } catch {
      setResetSettingsError("Unable to delete all app data.");
      setResetSettingsBusy(false);
      setResetSettingsConfirming(false);
    }
  };

  const handleCreateLocalPlaylist = () => {
    setLocalPlaylistError(null);
    try {
      createLocalPlaylist(localPlaylistName);
      setLocalPlaylistName("");
    } catch (error) {
      setLocalPlaylistError(error instanceof Error ? error.message : "Unable to create local playlist.");
    }
  };

  const handleStartLastFmAuth = async () => {
    setLastFmBusy(true);
    setLastFmError(null);
    try {
      const auth = await LastFmService.startAuth();
      setLastFmAuth(auth);
    } catch (error) {
      setLastFmError(error instanceof Error ? error.message : "Unable to start Last.fm sign-in.");
    } finally {
      setLastFmBusy(false);
    }
  };

  const handleFinishLastFmAuth = async () => {
    if (!lastFmAuth) return;
    setLastFmBusy(true);
    setLastFmError(null);
    try {
      const session = await LastFmService.completeAuth(lastFmAuth.token);
      setLastFmSession(session);
      setLastFmAuth(null);
      setLastFmScrobblingEnabled(true);
    } catch (error) {
      setLastFmError(error instanceof Error ? error.message : "Unable to finish Last.fm sign-in.");
    } finally {
      setLastFmBusy(false);
    }
  };

  const handleDisconnectLastFm = async () => {
    setLastFmBusy(true);
    setLastFmError(null);
    try {
      await LastFmService.disconnect();
      setLastFmSession(null);
      setLastFmAuth(null);
    } catch (error) {
      setLastFmError(error instanceof Error ? error.message : "Unable to disconnect Last.fm.");
    } finally {
      setLastFmBusy(false);
    }
  };

  const handleAddLocalPlaylistPath = (playlistId: string) => {
    setLocalPlaylistError(null);
    const path = localPlaylistPathInputs[playlistId]?.trim() ?? "";
    if (!path) {
      setLocalPlaylistError("Enter a folder path before adding it.");
      return;
    }
    addLocalPlaylistPath(playlistId, path);
    setLocalPlaylistPathInputs((current) => ({ ...current, [playlistId]: "" }));
  };

  const handleBrowseLocalPlaylistPath = async (playlistId: string) => {
    setLocalPlaylistError(null);
    setLocalPlaylistBrowsingId(playlistId);
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: "Choose music folder",
      });
      if (typeof selected !== "string") return;
      addLocalPlaylistPath(playlistId, selected);
      setLocalPlaylistPathInputs((current) => ({
        ...current,
        [playlistId]: "",
      }));
    } catch {
      setLocalPlaylistError("Unable to open the folder picker.");
    } finally {
      setLocalPlaylistBrowsingId(null);
    }
  };

  const handleShortcutCapture = (
    event: KeyboardEvent<HTMLButtonElement>,
    action: KeyboardShortcutAction,
  ) => {
    if (listeningShortcut !== action) return;

    event.preventDefault();
    event.stopPropagation();

    if (event.code === "Escape") {
      setListeningShortcut(null);
      return;
    }

    const shortcut = captureKeyboardShortcut(event.nativeEvent);
    if (!shortcut) return;

    setKeyboardShortcut(action, shortcut);
    setListeningShortcut(null);
  };

  useEffect(() => {
    if (!listeningShortcut) return undefined;

    const handleShortcutKeyDown = (event: globalThis.KeyboardEvent) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.code === "Escape") {
        setListeningShortcut(null);
        return;
      }

      const shortcut = captureKeyboardShortcut(event);
      if (!shortcut) return;

      setKeyboardShortcut(listeningShortcut, shortcut);
      setListeningShortcut(null);
    };

    window.addEventListener("keydown", handleShortcutKeyDown, true);
    return () => window.removeEventListener("keydown", handleShortcutKeyDown, true);
  }, [listeningShortcut]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-7">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua conta, biblioteca, aparência e comportamento da janela.
          </p>
        </div>
      </header>

      {/* Vertical nav rather than a pill row: it has room for a description per
          category and scales as sections are added, the way desktop settings do.
          The nav sticks so the categories stay reachable while a long panel scrolls. */}
      <div className="flex min-h-0 flex-1 items-start gap-10">
        <nav
          className="sticky top-0 flex w-56 shrink-0 flex-col gap-0.5"
          role="tablist"
          aria-label="Settings categories"
        >
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "group/tab relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  isActive ? "text-foreground" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="settings-tab-active"
                    transition={{ type: "spring", stiffness: 520, damping: 42 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-card"
                  />
                )}
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                    isActive ? "bg-primary/15 text-primary" : "bg-card/70 text-muted-foreground",
                  )}
                >
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{tab.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-h-0 w-full min-w-0 max-w-2xl flex-1 flex-col">

      {activeTab === "about" && (
        <div className="flex flex-col gap-5" role="tabpanel" aria-label="Configurações de sobre">
          <section className={SETTINGS_CARD} aria-labelledby="account-settings-title">
            <SettingsCardHeader
              title="Conta"
              titleId="account-settings-title"
              icon={<UserIcon size={18} aria-hidden="true" />}
              description={isSignedIn ? "Conectado ao YouTube Music" : "Nenhuma conta conectada"}
              status={
                <span className={isSignedIn ? "text-primary" : "text-muted-foreground"}>
                  {isSignedIn ? "Conectado" : "Desconectado"}
                </span>
              }
            />

            {/* `justify-between` with a `min-w-0 flex-1` text column: without both, the name
                and description push the sign-out button off the right edge on long channel
                names instead of truncating. */}
            <div className="flex items-center justify-between gap-3">
              <AccountAvatar artworkUrl={account?.artworkUrl} className="size-11" iconSize={26} />

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-base font-medium text-foreground">
                  {isSignedIn ? account?.name || "YouTube Music" : "Não conectado"}
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {isSignedIn
                    ? `Sessão confirmada ${formatSessionAge(libraryState.sessionConfirmedAt)}.`
                    : "Faça login para carregar sua biblioteca."}
                </span>
              </div>

              {isSignedIn ? (
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  onClick={() => void libraryController.signOut()}
                >
                  <LogoutIcon size={18} />
                  Sair
                </button>
              ) : (
                <GoogleSignInButton
                  isBusy={authBusy}
                  onClick={() => void onSignIn()}
                />
              )}
            </div>

            {/* Separate Google logins, not channels — always shown once signed in, since this
                is where a second account gets added, not just switched to. */}
            {isSignedIn && (
              <div className="flex flex-col gap-1.5 border-t border-border pt-4">
                <GoogleAccountSwitcher
                  libraryController={libraryController}
                  showSingle
                  allowRemove
                  label="Contas"
                />
                <AddGoogleAccountButton disabled={authBusy} onClick={() => void onSignIn()} />
              </div>
            )}

            {/* Renders nothing unless the account actually has more than one channel. */}
            {isSignedIn && (
              <div className="flex flex-col gap-1.5 border-t border-border pt-4">
                <AccountSwitcher libraryController={libraryController} showSingle label="Canal" />
              </div>
            )}

            {libraryState.error && <p className="text-sm text-destructive">{libraryState.error}</p>}
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="lastfm-settings-title">
            <SettingsCardHeader
              title="Last.fm"
              titleId="lastfm-settings-title"
              icon={<LastFmIcon size={18} aria-hidden="true" />}
              description={
                lastFmSession
                  ? `Conectado como ${lastFmSession.username}`
                  : "Conecte o Last.fm para registrar seu histórico de reprodução."
              }
              status={
                <span className={lastFmSession ? "text-primary" : "text-muted-foreground"}>
                  {lastFmSession ? "Conectado" : "Desconectado"}
                </span>
              }
            />

            <div className="flex flex-col gap-5">
              <SettingToggle
                title="Fazer scrobble das músicas"
                description="Envia atualizações de reprodução e scrobbles quando uma faixa atinge o limite do Last.fm."
                checked={lastFmSession ? lastFmScrobblingEnabled : false}
                disabled={!lastFmSession}
                onCheckedChange={setLastFmScrobblingEnabled}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                  <strong>Conexão da conta</strong>
                  <span>
                    {lastFmAuth
                      ? "Aprove a conexão no seu navegador e depois conclua aqui."
                      : lastFmSession
                        ? "Desconectar impede futuras atualizações do Last.fm a partir deste app."
                        : "Uma janela do navegador será aberta para você aprovar este aplicativo no Last.fm."}
                  </span>
                </span>
                {lastFmSession ? (
                  <button
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    type="button"
                    disabled={lastFmBusy}
                    onClick={() => void handleDisconnectLastFm()}
                  >
                    <LastFmIcon size={18} />
                    {lastFmBusy ? "Desconectando..." : "Desconectar"}
                  </button>
                ) : lastFmAuth ? (
                  <button
                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    type="button"
                    disabled={lastFmBusy}
                    onClick={() => void handleFinishLastFmAuth()}
                  >
                    <LastFmIcon size={18} />
                    {lastFmBusy ? "Concluindo..." : "Concluir conexão"}
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    type="button"
                    disabled={lastFmBusy}
                    onClick={() => void handleStartLastFmAuth()}
                  >
                    <LastFmIcon size={18} />
                    {lastFmBusy ? "Abrindo..." : "Conectar Last.fm"}
                  </button>
                )}
              </div>

              {lastFmError && <p className="text-sm text-destructive">{lastFmError}</p>}
            </div>
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="discord-settings-title">
            <h2 className="text-lg font-semibold text-foreground" id="discord-settings-title">
              Discord
            </h2>

            <div className="flex flex-col gap-5">
              <SettingToggle
                title="Mostrar o que você está ouvindo"
                description="Publica a faixa atual, artista e capa no seu perfil do Discord. Desativar isso limpa o status atual."
                checked={discordPresenceEnabled}
                onCheckedChange={(enabled) => void DiscordRpcService.setEnabled(enabled)}
              />
            </div>
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="about-settings-title">
            <h2 className="text-lg font-semibold text-foreground" id="about-settings-title">
              Sobre
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                  <strong>Atualizações</strong>
                  <span>
                    Versão instalada: {
                      installedVersion
                        ? installedVersion === "Unknown" ? installedVersion : `v${installedVersion}`
                        : "Carregando..."
                    }
                  </span>
                </span>
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  disabled={updateStatus === "checking"}
                  onClick={() => void handleCheckForUpdates()}
                >
                  <RefreshIcon size={18} />
                  {updateStatus === "checking" ? "Verificando..." : "Verificar atualizações"}
                </button>
              </div>

              {updateResult && (
                <div className="flex flex-col gap-1">
                  <span>
                    {updateStatus === "installing"
                      ? updateProgress?.percent !== undefined
                        ? `Baixando versão ${updateResult.version}: ${updateProgress.percent}%`
                        : `Preparando versão ${updateResult.version}...`
                      : `A versão ${updateResult.version} está disponível.`}
                  </span>
                  {updateResult.canInstall && (
                    <button
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      type="button"
                      disabled={updateStatus === "installing"}
                      onClick={() => void handleInstallUpdate()}
                    >
                      {updateStatus === "installing" ? "Instalando..." : "Instalar"}
                    </button>
                  )}
                  {/* The one link where a silent failure strands the user: if this cannot
                      open, they have no other route to the download. */}
                  <ExternalLinkButton
                    label={updateResult.canInstall ? "Ver alterações" : "Baixar"}
                    url={updateResult.releaseUrl}
                    className="px-4 py-2"
                  />
                </div>
              )}
              {updateStatus === "current" && (
                <p className="text-sm text-muted-foreground">Você está na versão mais recente.</p>
              )}
              {updateStatus === "error" && (
                <p className="text-sm text-destructive">{updateError}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                  <strong>Início rápido</strong>
                  <span>Rever a apresentação guiada.</span>
                </span>
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  onClick={onRestartOnboarding}
                >
                  <RefreshIcon size={18} />
                  Iniciar introdução
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "system" && (
        <div className="flex flex-col gap-5" role="tabpanel" aria-label="Configurações da biblioteca">
          <section className={SETTINGS_CARD} aria-labelledby="library-local-title">
            <SettingsCardHeader
              title="Músicas locais"
              titleId="library-local-title"
              icon={<FolderIcon size={18} aria-hidden="true" />}
              description="Pastas neste computador verificadas em listas de reprodução."
            />

            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                  <strong>Playlists locais</strong>
                  <span>Crie playlists a partir de pastas neste computador.</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className={cn(SETTINGS_FIELD, "w-44")}
                    type="text"
                    value={localPlaylistName}
                    placeholder="Nome da playlist"
                    aria-label="Nome da playlist local"
                    onChange={(event) => setLocalPlaylistName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleCreateLocalPlaylist();
                    }}
                  />
                  <button
                    className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    type="button"
                    onClick={handleCreateLocalPlaylist}
                  >
                    <FolderAddIcon size={18} />
                    Criar
                  </button>
                </div>
              </div>

              {localPlaylistError && <p className="text-sm text-destructive">{localPlaylistError}</p>}

              {localPlaylists.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {localPlaylists.map((playlist) => (
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-background/40 px-3 py-2 text-sm" key={playlist.id}>
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-foreground">
                          <FolderIcon size={18} aria-hidden="true" />
                          {playlist.name}
                        </span>
                        <button
                          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          type="button"
                          onClick={() => deleteLocalPlaylist(playlist.id)}
                        >
                          <TrashIcon size={18} />
                          Excluir
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                          <input
                            className={cn(SETTINGS_FIELD, "flex-1")}
                            type="text"
                            value={localPlaylistPathInputs[playlist.id] ?? ""}
                            placeholder="C:\Músicas ou /Users/nome/Music"
                            aria-label={`Pasta para ${playlist.name}`}
                            onChange={(event) => setLocalPlaylistPathInputs((current) => ({
                              ...current,
                              [playlist.id]: event.target.value,
                            }))}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") handleAddLocalPlaylistPath(playlist.id);
                            }}
                          />
                          <button
                            type="button"
                            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            disabled={localPlaylistBrowsingId === playlist.id}
                            title="Procurar pasta"
                            aria-label={`Procurar pasta para ${playlist.name}`}
                            onClick={() => void handleBrowseLocalPlaylistPath(playlist.id)}
                          >
                            <FolderOpenIcon size={17} aria-hidden="true" />
                          </button>
                        </span>
                        <button
                          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          type="button"
                          onClick={() => handleAddLocalPlaylistPath(playlist.id)}
                        >
                          Adicionar
                        </button>
                      </div>

                      {playlist.paths.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {playlist.paths.map((path) => (
                            <div className="flex items-center justify-between gap-3 rounded-lg bg-background/40 px-3 py-2 text-sm" key={path}>
                              <span>{path}</span>
                              <button
                                type="button"
                                aria-label={`Remover ${path}`}
                                onClick={() => removeLocalPlaylistPath(playlist.id, path)}
                              >
                                <TrashIcon size={16} aria-hidden="true" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="px-1 py-3 text-sm text-muted-foreground">Nenhuma pasta adicionada ainda.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </section>

          <section className={SETTINGS_CARD} aria-labelledby="library-storage-title">
            <SettingsCardHeader
              title="Armazenamento"
              titleId="library-storage-title"
              icon={<DownloadIcon size={18} aria-hidden="true" />}
              description="Espaço em disco permitido para o YouTune."
            />

            <div className="flex flex-wrap items-end justify-between gap-4 py-2">
              <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                <strong>Cache</strong>
                <span className="tabular-nums">
                  {cacheStats
                    ? `${formatBytes(cacheStats.usedBytes)} de ${formatBytes(cacheStats.maxBytes)}`
                    : "Carregando…"}
                  {cacheStats ? ` · ${cacheStats.entryCount} itens` : ""}
                </span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* The caption sits above the field rather than inside it: nested in a
                    fixed-width pill it wrapped onto two lines and squeezed the number. */}
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Tamanho máximo
                  <span className="flex w-28 items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-sm text-foreground focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring/60">
                    <input
                      className="w-full min-w-0 bg-transparent tabular-nums outline-none"
                      type="number"
                      min="0.25"
                      max="64"
                      step="0.25"
                      value={cacheSizeGb}
                      disabled={cacheBusy}
                      onChange={(event) => setCacheSizeGb(event.target.value)}
                    />
                    <span className="shrink-0 text-muted-foreground">GB</span>
                  </span>
                </label>
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  disabled={cacheBusy}
                  onClick={() => void saveCacheSize()}
                >
                  Salvar
                </button>
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  disabled={cacheBusy}
                  onClick={() => void handleClearCache()}
                >
                  <TrashIcon size={18} />
                  Limpar cache
                </button>
              </div>
            </div>

            {cacheError && <p className="text-sm text-destructive">{cacheError}</p>}


            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                <strong>Downloads</strong>
                <span>
                  {offlineState.usedBytes > 0 || Object.keys(offlineState.entries).length > 0
                    ? `${Object.keys(offlineState.entries).length} músicas · ${formatBytes(offlineState.usedBytes)}`
                    : "Nenhuma música baixada ainda."}
                  {offlineState.downloadingId
                    ? offlineState.progress !== null
                      ? ` · baixando ${offlineState.progress}%`
                      : " · baixando"
                    : ""}
                  {offlineState.queued.length > 0
                    ? ` · ${offlineState.queued.length} na fila`
                    : ""}
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Tamanho máximo
                  <span className="flex w-28 items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-sm text-foreground focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring/60">
                    <input
                      className="w-full min-w-0 bg-transparent outline-none"
                      type="number"
                      min={1}
                      max={512}
                      value={Math.round(offlineMaxGb)}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isFinite(next)) return;
                        setOfflineMaxGb(next);
                        setOfflineMaxBytes(Math.max(1, next) * 1024 ** 3);
                      }}
                      aria-label="Tamanho máximo de download em gigabytes"
                    />
                    <span className="shrink-0 text-xs text-muted-foreground">GB</span>
                  </span>
                </label>
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  disabled={clearingDownloads || Object.keys(offlineState.entries).length === 0}
                  onClick={() => {
                    setClearingDownloads(true);
                    void removeAllDownloads().finally(() => setClearingDownloads(false));
                  }}
                >
                  <TrashIcon size={18} />
                  {clearingDownloads ? "Removendo..." : "Remover tudo"}
                </button>
              </div>
            </div>

          </section>

          <section className={SETTINGS_CARD} aria-labelledby="library-quality-title">
            <SettingsCardHeader
              title="Qualidade"
              titleId="library-quality-title"
              icon={<PlayIcon size={18} aria-hidden="true" />}
              description="Taxa de bits escolhida ao reproduzir ou salvar faixas."
            />

            <SettingRow
              title="Qualidade de reprodução"
              description="Aplica-se a músicas reproduzidas pela rede. Menor qualidade consome menos dados."
            >
              {(labelId) => (
                <Select
                  className="w-52"
                  value={streamingQuality}
                  onValueChange={(value) => setStreamingQuality(value as AudioQuality)}
                >
                  <SelectTrigger aria-labelledby={labelId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AUDIO_QUALITY_LABELS) as AudioQuality[]).map((quality) => (
                      <SelectItem key={quality} value={quality}>
                        {AUDIO_QUALITY_LABELS[quality]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>


            <SettingRow
              title="Qualidade de download"
              description="Aplica-se a músicas salvas para ouvir offline. Maior qualidade soa melhor e ocupa mais espaço."
            >
              {(labelId) => (
                <Select
                  className="w-52"
                  value={downloadQuality}
                  onValueChange={(value) => setDownloadQuality(value as AudioQuality)}
                >
                  <SelectTrigger aria-labelledby={labelId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AUDIO_QUALITY_LABELS) as AudioQuality[]).map((quality) => (
                      <SelectItem key={quality} value={quality}>
                        {AUDIO_QUALITY_LABELS[quality]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>

          </section>

          <section className={SETTINGS_CARD} aria-labelledby="library-lyrics-title">
            <SettingsCardHeader
              title="Letras"
              titleId="library-lyrics-title"
              icon={<LyricsIcon size={18} aria-hidden="true" />}
              description="De onde vêm as letras e como são exibidas."
            />

            <SettingRow
              title="Traduzir letras"
              description="Mostra a tradução abaixo de cada linha. Envia as letras para o Google Tradutor."
            >
              {(labelId) => (
                <Select
                  className="w-52"
                  value={lyricsTranslationLang}
                  onValueChange={setLyricsTranslationLang}
                >
                  <SelectTrigger aria-labelledby={labelId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TRANSLATION_OFF}>Desativado</SelectItem>
                    {TRANSLATION_LANGUAGES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {getLanguageLabel(code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>


            <SettingRow
              title="Tamanho do texto das letras"
              description="Ajusta a escala da tela de letras. O tamanho ainda se adapta à janela."
            >
              {(labelId) => (
                <Select
                  className="w-52"
                  value={String(lyricsFontScale)}
                  onValueChange={(value) => setLyricsFontScale(Number(value))}
                >
                  <SelectTrigger aria-labelledby={labelId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LYRICS_FONT_SCALES.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>


            <SettingRow
              title="Fonte preferida de letras"
              description="Consultada primeiro ao abrir uma música. Se não houver letra nela, as outras fontes serão consultadas."
            >
              {(labelId) => (
                <Select
                  className="w-52"
                  value={preferredLyricsSource}
                  onValueChange={setPreferredLyricsSourceId}
                >
                  <SelectTrigger aria-labelledby={labelId}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AUTO_LYRICS_SOURCE}>Automático</SelectItem>
                    {LYRICS_SOURCES.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>

          </section>

          <section className={SETTINGS_CARD} aria-labelledby="library-system-title">
            <SettingsCardHeader
              title="Sistema"
              titleId="library-system-title"
              icon={<SettingsIcon size={18} aria-hidden="true" />}
              description="Como o YouTune se comporta fora da janela."
            />

            <SettingToggle
              title="Iniciar com o sistema"
              description="Inicia o YouTune automaticamente ao ligar o computador."
              checked={autostartEnabled}
              disabled={autostartLoading}
              onCheckedChange={(checked) => void handleAutostartChange(checked)}
            />

            {autostartError && <p className="text-sm text-destructive">{autostartError}</p>}


            <SettingToggle
              title="Minimizar para a bandeja"
              description="Fechar a janela oculta o YouTune na bandeja do sistema e mantém a música tocando. Saia pelo ícone da bandeja."
              checked={minimizeToTray}
              onCheckedChange={setMinimizeToTray}
            />


            <SettingToggle
              title="Lembrar tamanho e posição da janela"
              description="Reabre a janela principal com o último tamanho e posição na tela."
              checked={mainWindowGeometryPersistenceEnabled}
              onCheckedChange={setMainWindowGeometryPersistenceEnabled}
            />


          </section>

          <section className={SETTINGS_CARD} aria-labelledby="library-trouble-title">
            <SettingsCardHeader
              title="Solução de problemas"
              titleId="library-trouble-title"
              icon={<BugIcon size={18} aria-hidden="true" />}
              description="Diagnósticos e restauração completa irreversível."
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                <strong>Registro do aplicativo (Log)</strong>
                <span>Abre o arquivo de registro atual para compartilhamento ou diagnóstico.</span>
              </span>
              <button
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                type="button"
                disabled={logOpening}
                onClick={() => void handleOpenLog()}
              >
                <LogFileIcon size={18} />
                {logOpening ? "Abrindo..." : "Abrir registro"}
              </button>
            </div>

            {logError && <p className="text-sm text-destructive">{logError}</p>}


            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                <strong>Excluir todos os dados do app</strong>
                <span>Redefine configurações, cache, conta, fila, abas, introdução e dados locais.</span>
              </span>
              <button
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                type="button"
                disabled={resetSettingsBusy}
                onClick={() => void handleClearAllSettings()}
              >
                <TrashIcon size={18} />
                {resetSettingsBusy
                  ? "Excluindo..."
                  : resetSettingsConfirming
                    ? "Pressione novamente para confirmar"
                    : "Excluir tudo"}
              </button>
            </div>

            {resetSettingsError && <p className="text-sm text-destructive">{resetSettingsError}</p>}
          </section>
        </div>
      )}

      {activeTab === "shortcuts" && (
        <div className="flex flex-col gap-5" role="tabpanel" aria-label="Configurações de atalhos de teclado">
          <section className={SETTINGS_CARD} aria-labelledby="keyboard-shortcuts-settings-title">
            <h2
              className="text-lg font-semibold text-foreground"
              id="keyboard-shortcuts-settings-title"
            >
              Atalhos de teclado
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={cn(SETTING_LABEL, "min-w-0 flex-1")}>
                  <strong>Restaurar atalhos</strong>
                  <span>Restaura todos os atalhos de teclado para o padrão.</span>
                </span>
                <button
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  type="button"
                  onClick={resetKeyboardShortcuts}
                >
                  <RefreshIcon size={18} />
                  Restaurar todos
                </button>
              </div>

              {KEYBOARD_SHORTCUT_ACTIONS.map((shortcutAction) => {
                const shortcut = keyboardShortcuts[shortcutAction.id];
                const isListening = listeningShortcut === shortcutAction.id;

                return (
                  <div className="flex items-center justify-between gap-4 py-2" key={shortcutAction.id}>
                    <span className={SETTING_LABEL}>
                      <strong>{shortcutAction.label}</strong>
                      <span>{shortcutAction.description}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className={cn("min-w-32 rounded-lg bg-background px-2.5 py-1.5 text-center text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring", isListening && "text-primary")}
                        type="button"
                        aria-pressed={isListening}
                        onClick={() => setListeningShortcut(shortcutAction.id)}
                        onKeyDown={(event) => handleShortcutCapture(event, shortcutAction.id)}
                        onBlur={() => {
                          if (isListening) setListeningShortcut(null);
                        }}
                      >
                        {isListening ? "Pressione o atalho..." : formatKeyboardShortcut(shortcut)}
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        type="button"
                        onClick={() => resetKeyboardShortcut(shortcutAction.id)}
                      >
                        Restaurar
                      </button>
                      <button
                        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        type="button"
                        disabled={!shortcut}
                        onClick={() => setKeyboardShortcut(shortcutAction.id, null)}
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {activeTab === "window" && (
        <div className="flex flex-col gap-5" role="tabpanel" aria-label="Configurações de janela e estilo">
          <section className={SETTINGS_CARD} aria-labelledby="window-settings-title">
            <SettingsCardHeader
              title="Controles da janela"
              titleId="window-settings-title"
              icon={<QueuePanelIcon size={18} aria-hidden="true" />}
              description="Escolha os botões da barra de título e o comportamento do player compacto."
            />

            <SettingToggle
              title="Mini player"
              description="Mostra controles compactos quando a janela principal não está em foco. Desativar fecha sua janela e libera cerca de 30 MB."
              checked={miniPlayerEnabled}
              onCheckedChange={setMiniPlayerEnabled}
            />

            <SettingRow
              title="Barra lateral da biblioteca"
              description="Quanto espaço a barra de playlists ocupa. 'Expandir ao passar o cursor' mantém o tamanho compacto enquanto permite ler os nomes."
            >
              {() => (
                <Select
                  className="w-52"
                  value={sidebarMode}
                  onValueChange={(value) => setSidebarMode(value as SidebarMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIDEBAR_MODES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>

            <SettingRow
              title="Barra de foco do mini player"
              description="Escolha o que a barra deslizante expandida controla."
            >
              {() => (
                <Select
                  className="w-44"
                  value={miniPlayerHoverAction}
                  onValueChange={(value) =>
                    setMiniPlayerHoverAction(value as MiniPlayerHoverAction)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seek">Posição da música</SelectItem>
                    <SelectItem value="volume">Volume</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </SettingRow>

            <div className="flex items-center justify-between gap-4 py-2">
              <span className={SETTING_LABEL}>
                <strong>Posição do mini player</strong>
                <span>Move o mini player de volta para o canto inferior central da tela.</span>
              </span>
              <button
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                type="button"
                disabled={miniPlayerResetting}
                onClick={() => void handleResetMiniPlayerPosition()}
              >
                {miniPlayerResetting ? "Redefinindo..." : "Redefinir posição"}
              </button>
            </div>

            <SettingRow
              title="Estilo dos botões da janela"
              description={isLinux
                ? "Como minimizar, maximizar e fechar são desenhados. Alternar para o nativo do SO reinicia o app."
                : "Como os botões de minimizar, maximizar e fechar são desenhados."}
            >
              {(labelId) => (
                <div role="group" aria-labelledby={labelId}>
                  <Tabs
                    value={windowControlStyle}
                    onValueChange={(value) =>
                      handleWindowControlStyleChange(value as WindowControlStyle)}
                    variant="segment"
                  >
                    <TabsList>
                      <TabsTrigger value="macos">macOS</TabsTrigger>
                      <TabsTrigger value="windows">Windows</TabsTrigger>
                      <TabsTrigger value="native">Nativo do SO</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}
            </SettingRow>

            {/* Only reachable when it does something: hidden once native chrome takes over,
                and off tiling compositors the buttons already show without this. */}
            {isLinux && tilingWindowManager && windowControlStyle !== "native" && (
              <SettingToggle
                title="Mostrar neste compositor"
                description="Compositores lado a lado (tiling) não desenham botões de janela por padrão. Ative para exibi-los mesmo assim."
                checked={forceWindowControls}
                onCheckedChange={setForceWindowControls}
              />
            )}

            {isLinux && (
              <SettingToggle
                title="Mostrar nos controles de mídia do sistema"
                description="Integra a reprodução aos controles de mídia e teclas multimídia do sistema (MPRIS)."
                checked={linuxMediaSession}
                onCheckedChange={setLinuxMediaSession}
              />
            )}
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="behavior-settings-title">
            <div className="flex items-center gap-2">
              <h2 className="text-lg" id="behavior-settings-title">Comportamento</h2>
            </div>

            <SettingToggle
              title="Barra do player compacta"
              description="Encaixa a barra de progresso abaixo dos controles em vez de ocupar toda a largura."
              checked={compactPlayerBar}
              onCheckedChange={setCompactPlayerBar}
            />

            <SettingToggle
              title="Sempre mostrar controles extras"
              description="Mantém letras e fila visíveis em vez de exibi-los apenas ao passar o cursor."
              checked={extraPlayerControlsAlwaysVisible}
              onCheckedChange={setExtraPlayerControlsAlwaysVisible}
            />
          </section>
        </div>
      )}

      {activeTab === "playback" && (
        <div className="flex flex-col gap-5" role="tabpanel" aria-label="Configurações de reprodução">
          <section className={SETTINGS_CARD} aria-labelledby="adblock-settings-title">
            <SettingsCardHeader
              title="Sem Anúncios e Carregamento Rápido"
              titleId="adblock-settings-title"
              icon={<SpeedIcon size={18} aria-hidden="true" />}
              description="Elimine comerciais e acelere o início de reprodução das músicas."
            />

            <SettingToggle
              title="Bloquear anúncios nas músicas"
              description="Transmite diretamente dos servidores de áudio de alta velocidade (googlevideo), garantindo reprodução 100% contínua e sem nenhuma interrupção por anúncios ou comerciais."
              checked={adBlockEnabled}
              onCheckedChange={setAdBlockEnabled}
            />

            <SettingToggle
              title="Carregamento e pré-aquecimento ultrarrápido"
              description="Pré-aquece a conexão e mantém os tokens de áudio em cache em segundo plano para que qualquer música comece a tocar instantaneamente ao clicar."
              checked={fastLoadingEnabled}
              onCheckedChange={setFastLoadingEnabled}
            />
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="playback-engine-title">
            <SettingsCardHeader
              title="Motor de áudio"
              titleId="playback-engine-title"
              icon={<PlayIcon size={18} aria-hidden="true" />}
              description="O que realmente reproduz o som."
            />

            <SettingRow
              title="Método de reprodução"
              description={
                audioEngineMode === "native"
                  ? "O YouTune reproduz cada faixa nativamente. Cerca de 90 MB mais leve, início um pouco mais lento, sem transição contínua ou crossfade."
                  : "Um player integrado do YouTube reproduz cada faixa. Consome cerca de 90 MB a mais, inicia mais rápido, necessário para reprodução contínua e crossfade."
              }
            >
              {() => (
                <Select
                  className="w-52"
                  value={audioEngineMode}
                  onValueChange={(value) => setAudioEngineMode(value as AudioEngineMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIO_ENGINE_MODES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </SettingRow>

            <p className="px-1 text-xs text-muted-foreground">
              Aplica-se a partir da próxima música.
            </p>

            <OutputDeviceSetting engineMode={audioEngineMode} />

            <EqualizerSettings engineMode={audioEngineMode} />

            <SettingToggle
              title="Obter streams com sua conta"
              description="Anexa sua sessão ao obter faixas — necessário para taxas de bits do plano Premium. Downloads sempre são obtidos anonimamente."
              checked={authenticatedStreaming}
              onCheckedChange={setAuthenticatedStreaming}
            />

            <SettingToggle
              title="Adicionar reproduções ao histórico do YouTube Music"
              description="Registra as reproduções no YouTube, melhorando suas recomendações. Também ativa a opção acima."
              checked={youtubeScrobbling}
              onCheckedChange={(enabled) => {
                // Paired here rather than inside the setter, so the toolbar shortcut can flip
                // scrobbling on its own without silently changing stream resolution too.
                setYouTubeScrobbling(enabled);
                setAuthenticatedStreaming(enabled);
              }}
            />
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="playback-settings-title">
            <SettingsCardHeader
              title="Transições"
              titleId="playback-settings-title"
              icon={<PlayIcon size={18} aria-hidden="true" />}
              description="Como uma música faz a transição para a próxima."
            />

            <SettingToggle
              title="Reprodução contínua (Gapless)"
              description="Carrega a próxima faixa enquanto a atual ainda toca, para que álbuns e shows toquem sem pausas entre as músicas."
              checked={gaplessEnabled}
              onCheckedChange={setGaplessEnabled}
            />

            <SettingRow
              title="Crossfade"
              description={
                crossfadeSec > 0
                  ? `Sobrepõe cada faixa com a próxima por ${crossfadeSec} segundo${
                    crossfadeSec === 1 ? "" : "s"
                  }.`
                  : "Desativado. Ajuste a barra para sobrepor o final de cada música com o início da próxima."
              }
            >
              {(labelId) => (
                <span className="flex items-center gap-3">
                  <RangeSlider
                    className="w-44"
                    value={crossfadeSec}
                    min={0}
                    max={MAX_CROSSFADE_SEC}
                    step={1}
                    onValueChange={setCrossfadeSec}
                    aria-label="Duração do crossfade em segundos"
                  />
                  <span
                    id={labelId}
                    className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground"
                  >
                    {crossfadeSec > 0 ? `${crossfadeSec}s` : "Desativado"}
                  </span>
                </span>
              )}
            </SettingRow>

            {/*
              Crossfading a downloaded track is not possible: offline files play through an
              audio element rather than the deck pair the overlap needs. Saying so beats
              leaving people to wonder why it only sometimes works.
            */}
            <p className="text-sm text-muted-foreground">
              Ambos se aplicam a faixas reproduzidas via streaming. Músicas locais ou baixadas sempre tocam em sequência direta.
            </p>
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="session-settings-title">
            <SettingsCardHeader
              title="Sessão"
              titleId="session-settings-title"
              icon={<QueuePanelIcon size={18} aria-hidden="true" />}
              description="O que é restaurado quando você reabre o YouTune."
            />

            <SettingToggle
              title="Restaurar abas e filas"
              description="Reabre suas abas, filas e posição de reprodução ao iniciar. A reprodução sempre inicia pausada."
              checked={sessionRestoreEnabled}
              onCheckedChange={setSessionRestoreEnabled}
            />
          </section>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="flex flex-col gap-5" role="tabpanel" aria-label="Configurações de aparência">
          <section className={SETTINGS_CARD} aria-labelledby="theme-settings-title">
            <SettingsCardHeader
              title="Tema"
              titleId="theme-settings-title"
              icon={<PaletteIcon size={18} aria-hidden="true" />}
              description="Aplica-se instantaneamente em todas as janelas."
            />

            <div
              className="grid grid-cols-3 gap-2"
              role="radiogroup"
              aria-labelledby="theme-settings-title"
            >
              {THEME_OPTIONS.map((option) => {
                const isActive = themePreference === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setThemePreference(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl p-3 transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      isActive ? "bg-primary/15" : "bg-background/40 hover:bg-card",
                    )}
                  >
                    {/* Miniature window preview rather than a colour dot — it shows what
                        the choice actually does. */}
                    <span
                      className={cn(
                        "flex h-12 w-full flex-col justify-end overflow-hidden rounded-lg p-1 ring-1",
                        option.swatch,
                        isActive ? "ring-primary" : "ring-black/10",
                      )}
                      aria-hidden="true"
                    >
                      <span
                        className={cn(
                          "h-2 w-full rounded-sm",
                          option.value === "light" ? "bg-neutral-300" : "bg-neutral-700",
                        )}
                      />
                    </span>
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="accent-color-title">
            <SettingsCardHeader
              title="Cor dos botões e destaques"
              titleId="accent-color-title"
              icon={<PaletteIcon size={18} aria-hidden="true" />}
              description="Escolha a cor principal dos botões, controles de reprodução e destaques visuais."
            />

            <div className="flex flex-col gap-4">
              <div
                className="grid grid-cols-3 gap-2.5 sm:grid-cols-5"
                role="radiogroup"
                aria-label="Cores de destaque"
              >
                {ACCENT_COLOR_PRESETS.map((preset) => {
                  const isSelected = accentColor.toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setAccentColor(preset.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border/60 bg-background/40 hover:border-border hover:bg-card",
                      )}
                    >
                      <span
                        className="flex size-7 items-center justify-center rounded-full text-white shadow-inner ring-2 ring-white/10 transition-transform"
                        style={{ backgroundColor: preset.value }}
                      >
                        {isSelected && <CheckIcon size={14} strokeWidth={2.5} />}
                      </span>
                      <span className="truncate text-xs font-medium text-foreground">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <span className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Cor personalizada</span>
                  <span className="text-xs text-muted-foreground">Escolha qualquer tonalidade via seletor de cores</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="size-9 cursor-pointer rounded-lg border border-border bg-background p-1"
                    title="Seletor de cor personalizada"
                    aria-label="Seletor de cor personalizada"
                  />
                  <input
                    type="text"
                    value={accentColor.toUpperCase()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        setAccentColor(val);
                      }
                    }}
                    maxLength={7}
                    className={cn(SETTINGS_FIELD, "w-24 text-center font-mono text-xs uppercase")}
                    aria-label="Código Hex da cor"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="toolbar-settings-title">
            <div className="min-w-0">
              <h2 className="text-lg" id="toolbar-settings-title">Barra de título</h2>
              <p className="text-sm text-muted-foreground">
                Quais botões opcionais ficam ao lado dos controles da janela.
              </p>
            </div>

            {TOOLBAR_ITEMS.map((item) => (
              <ToolbarItemToggle key={item.id} item={item} />
            ))}
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="home-settings-title">
            <div className="min-w-0">
              <h2 className="text-lg" id="home-settings-title">Início</h2>
              <p className="text-sm text-muted-foreground">
                Quais seções a página inicial exibe.
              </p>
            </div>

            <SettingToggle
              title="Feito para você"
              description="O carrossel de recomendações no topo. Ocultá-lo mantém o botão de surpresa e mais recomendações funcionando."
              checked={madeForYouVisible}
              onCheckedChange={setMadeForYouVisible}
            />
          </section>

          <section className={SETTINGS_CARD} aria-labelledby="motion-settings-title">
            <div className="min-w-0">
              <h2 className="text-lg" id="motion-settings-title">Movimento e desempenho</h2>
              <p className="text-sm text-muted-foreground">
                Desative essas opções em computadores mais modestos.
              </p>
            </div>

            <PotatoPcSettings />
          </section>
        </div>
      )}

        </div>
      </div>
    </main>
  );
}
