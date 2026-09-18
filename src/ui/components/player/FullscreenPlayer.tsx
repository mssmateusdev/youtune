import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SpinnerSteps } from "@/components/motion/loader";
import { cn, formatMinutesSeconds } from "@/lib/utils";
import {
  CloseIcon,
  FullScreenIcon,
  HeartActiveIcon,
  HeartIcon,
  PauseActiveIcon,
  PlayActiveIcon,
  QuitFullScreenIcon,
  RepeatActiveIcon,
  RepeatIcon,
  RepeatOneActiveIcon,
  ShuffleActiveIcon,
  ShuffleIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  VolumeLoudIcon,
  VolumeMutedIcon,
  VolumeSmallIcon,
} from "@/ui/icons";
import {
  playerController,
  shallowEqual,
  useLibraryState,
  usePlayerSelector,
} from "../../../player/playerStore";
import { playerUIStore, usePlayerUIState } from "../../stores/playerUIStore";
import { TrackArtwork } from "../TrackArtwork";
import { ArtistLinks } from "../ArtistLinks";
import { useTrackContextMenu } from "../TrackContextMenu";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function FullscreenPlayer() {
  const uiState = usePlayerUIState();
  const playerState = usePlayerSelector(
    (state) => ({
      currentTrack: state.currentTrack,
      status: state.status,
      shuffleEnabled: state.shuffleEnabled,
      playbackOrderMode: state.playbackOrderMode,
      volume: state.volume,
      muted: state.muted,
    }),
    shallowEqual,
  );
  const libraryState = useLibraryState();
  const { openTrackMenu, toggleTrackLike } = useTrackContextMenu();

  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOsFullscreen, setIsOsFullscreen] = useState(false);

  const isSeekingRef = useRef(false);
  const isDraggingVolumeRef = useRef(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const lastActivityTimeRef = useRef(0);

  const currentTrack = playerState.currentTrack;
  const isPlaying = playerState.status === "playing";
  const isLoading = playerState.status === "loading";

  // Check initial OS fullscreen
  useEffect(() => {
    void getCurrentWindow().isFullscreen().then(setIsOsFullscreen);
  }, []);

  // Update current time and duration in a smooth frame loop
  useEffect(() => {
    let animId = 0;
    const updateTime = () => {
      if (!isSeekingRef.current) {
        const t = playerController.getCurrentTime();
        const d = playerController.getDuration() || currentTrack?.durationSec || 0;
        setCurrentTime(t);
        setDuration(d);
      }
      animId = requestAnimationFrame(updateTime);
    };
    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, [currentTrack?.durationSec]);

  // Close handler
  const handleClose = useCallback(() => {
    playerUIStore.setFullscreenPlayer(false);
  }, []);

  // Toggle OS fullscreen
  const handleToggleOsFullscreen = useCallback(async () => {
    const win = getCurrentWindow();
    const current = await win.isFullscreen();
    await win.setFullscreen(!current);
    setIsOsFullscreen(!current);
  }, []);

  // Reset inactivity timer on user activity with throttling to avoid re-render storms
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityTimeRef.current > 120) {
      lastActivityTimeRef.current = now;
      setIsControlsVisible(true);
    }
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = window.setTimeout(() => {
      if (!isSeekingRef.current && !isDraggingVolumeRef.current) {
        setIsControlsVisible(false);
      }
    }, 3000);
  }, []);

  useEffect(() => {
    handleUserActivity();
    return () => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [handleUserActivity]);

  // Keyboard controls inside FullscreenPlayer
  useEffect(() => {
    if (!uiState.isFullscreenPlayer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      handleUserActivity();

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          handleClose();
          break;
        case "f":
        case "F":
          event.preventDefault();
          handleClose();
          break;
        case "F11":
          event.preventDefault();
          void handleToggleOsFullscreen();
          break;
        case " ":
          event.preventDefault();
          void playerController.togglePlayPause();
          break;
        case "ArrowLeft":
          event.preventDefault();
          {
            const newTime = Math.max(0, playerController.getCurrentTime() - 5);
            setCurrentTime(newTime);
            void playerController.seekTo(newTime);
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          {
            const maxTime = duration || playerController.getDuration() || 0;
            const newTime = Math.min(maxTime, playerController.getCurrentTime() + 5);
            setCurrentTime(newTime);
            void playerController.seekTo(newTime);
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          void playerController.setVolume(Math.min(1, playerController.getVolume() + 0.05));
          break;
        case "ArrowDown":
          event.preventDefault();
          void playerController.setVolume(Math.max(0, playerController.getVolume() - 0.05));
          break;
        case "m":
        case "M":
          event.preventDefault();
          void playerController.toggleMute();
          break;
        case "j":
        case "J":
          event.preventDefault();
          void playerController.skipToPrevious();
          break;
        case "k":
        case "K":
          event.preventDefault();
          void playerController.togglePlayPause();
          break;
        case "l":
        case "L":
          event.preventDefault();
          void playerController.skipToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [uiState.isFullscreenPlayer, handleClose, handleToggleOsFullscreen, handleUserActivity, duration]);

  if (!uiState.isFullscreenPlayer || !currentTrack) {
    return null;
  }

  const canLike = currentTrack.source !== "local";
  const isLiked =
    canLike &&
    (libraryState.library?.likedSongs.some((track) => track.id === currentTrack.id) ?? false);

  const displayedVolume = playerState.muted ? 0 : playerState.volume;
  const VolumeGlyph = playerState.muted
    ? VolumeMutedIcon
    : displayedVolume < 0.5
      ? VolumeSmallIcon
      : VolumeLoudIcon;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#09090b] select-none",
        !isControlsVisible && "cursor-none",
      )}
      onMouseMove={handleUserActivity}
      onClick={handleUserActivity}
    >
      {/* Dynamic Ambient Blurred Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {currentTrack.artworkUrl ? (
          <div
            className="absolute -inset-20 scale-125 bg-cover bg-center opacity-30 blur-[80px] transition-all duration-1000 ease-out"
            style={{ backgroundImage: `url(${currentTrack.artworkUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-[#09090b] to-[#09090b]" />
        )}
        {/* Dark Vignette Overlay to guarantee high contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/95 via-[#09090b]/40 to-[#09090b]/80" />
      </div>

      {/* Top Header: Badge, Album & Action Buttons */}
      <header
        className={cn(
          "relative z-20 flex items-center justify-between px-8 pt-6 transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-white/90 shadow-sm backdrop-blur-md">
            YouTune
          </span>
          {currentTrack.album && (
            <span className="max-w-md truncate text-sm font-medium text-white/60">
              {currentTrack.album}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleOsFullscreen}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 shadow-md backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            title={isOsFullscreen ? "Janela normal (F11)" : "Tela cheia do monitor (F11)"}
            aria-label="Alternar tela cheia do monitor"
          >
            {isOsFullscreen ? <QuitFullScreenIcon size={19} /> : <FullScreenIcon size={19} />}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/80 shadow-md backdrop-blur-md transition-all hover:bg-white/20 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            title="Fechar tela cheia (Esc ou F)"
            aria-label="Fechar tela cheia"
          >
            <CloseIcon size={20} />
          </button>
        </div>
      </header>

      {/* Center Main Stage: Album Art & Track Info */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-2">
        <div className="flex flex-col items-center gap-6">
          {/* Large Artwork */}
          <div
            className="group relative aspect-square w-[min(380px,38vh)] shrink-0 overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/15 transition-transform duration-500 hover:scale-[1.02]"
            onContextMenu={(event) => openTrackMenu(event, currentTrack)}
          >
            <TrackArtwork
              className="size-full object-cover"
              size={400}
              artworkUrl={currentTrack.artworkUrl}
              iconSize={80}
            />
          </div>

          {/* Title, Artist & Like */}
          <div className="flex max-w-xl flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3">
              <h1 className="max-w-lg truncate text-2xl font-bold tracking-tight text-white drop-shadow-md sm:text-3xl">
                {currentTrack.title}
              </h1>
              {canLike && (
                <button
                  type="button"
                  onClick={() => toggleTrackLike(currentTrack)}
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    isLiked ? "text-primary" : "text-white/60 hover:text-white",
                  )}
                  title={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  aria-label={isLiked ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  {isLiked ? <HeartActiveIcon size={24} /> : <HeartIcon size={24} />}
                </button>
              )}
            </div>

            <div className="mt-1.5 text-base font-medium text-white/70 hover:text-white">
              <ArtistLinks artists={currentTrack.artists} fallback={currentTrack.artist} />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Controls Bar */}
      <footer
        className={cn(
          "relative z-20 flex flex-col gap-4 px-8 pb-8 transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {/* Custom High-Contrast Seek Bar */}
          <div className="group/seek flex w-full items-center gap-3">
            <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-white/75">
              {formatMinutesSeconds(currentTime)}
            </span>

            <div className="relative flex h-6 flex-1 items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="any"
                value={currentTime}
                onPointerDown={() => {
                  isSeekingRef.current = true;
                  playerUIStore.setSeeking(true);
                }}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                }}
                onPointerUp={(e) => {
                  const val = parseFloat(e.currentTarget.value);
                  void playerController.seekTo(val);
                  isSeekingRef.current = false;
                  playerUIStore.setSeeking(false);
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-primary outline-none transition-all hover:h-2"
                style={{
                  background: `linear-gradient(to right, var(--color-primary, #10b981) ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                }}
                aria-label="Posição da música"
              />
            </div>

            <span className="w-12 shrink-0 text-left text-xs font-medium tabular-nums text-white/50">
              {formatMinutesSeconds(duration)}
            </span>
          </div>

          {/* Transport Controls & Volume */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Shuffle & Repeat */}
            <div className="flex w-32 items-center gap-2">
              <button
                type="button"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  playerState.shuffleEnabled
                    ? "text-primary"
                    : "text-white/60 hover:text-white",
                )}
                onClick={() => playerController.toggleShuffle()}
                title={playerState.shuffleEnabled ? "Desativar aleatório" : "Ativar aleatório"}
                aria-label="Modo aleatório"
              >
                {playerState.shuffleEnabled ? <ShuffleActiveIcon size={20} /> : <ShuffleIcon size={20} />}
              </button>

              <button
                type="button"
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  playerState.playbackOrderMode !== "in-order"
                    ? "text-primary"
                    : "text-white/60 hover:text-white",
                )}
                onClick={() => playerController.cyclePlaybackOrderMode()}
                title="Modo de repetição"
                aria-label="Modo de repetição"
              >
                {playerState.playbackOrderMode === "repeat-one" ? (
                  <RepeatOneActiveIcon size={20} />
                ) : playerState.playbackOrderMode === "repeat-all" ? (
                  <RepeatActiveIcon size={20} />
                ) : (
                  <RepeatIcon size={20} />
                )}
              </button>
            </div>

            {/* Center: Previous, Play/Pause, Next */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => void playerController.skipToPrevious()}
                className="flex size-11 items-center justify-center rounded-full text-white/80 transition-all hover:scale-110 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                title="Faixa anterior (J)"
                aria-label="Faixa anterior"
              >
                <SkipPreviousIcon size={26} />
              </button>

              <button
                type="button"
                onClick={() => void playerController.togglePlayPause()}
                className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={isPlaying ? "Pausar (Espaço)" : "Reproduzir (Espaço)"}
                aria-label={isPlaying ? "Pausar" : "Reproduzir"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                    >
                      <SpinnerSteps className="size-6 text-primary-foreground" />
                    </motion.div>
                  ) : isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                    >
                      <PauseActiveIcon size={28} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                    >
                      <PlayActiveIcon size={28} className="ml-0.5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <button
                type="button"
                onClick={() => void playerController.skipToNext()}
                className="flex size-11 items-center justify-center rounded-full text-white/80 transition-all hover:scale-110 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                title="Próxima faixa (L)"
                aria-label="Próxima faixa"
              >
                <SkipNextIcon size={26} />
              </button>
            </div>

            {/* Right: Inline Volume Slider */}
            <div className="flex w-32 items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => void playerController.toggleMute()}
                className="flex size-8 items-center justify-center rounded-full text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                title={playerState.muted ? "Desmutar (M)" : "Mutar (M)"}
                aria-label="Volume"
              >
                <VolumeGlyph size={20} />
              </button>

              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(displayedVolume * 100)}
                onPointerDown={() => {
                  isDraggingVolumeRef.current = true;
                  playerUIStore.setDraggingVolume(true);
                }}
                onPointerUp={() => {
                  isDraggingVolumeRef.current = false;
                  playerUIStore.setDraggingVolume(false);
                }}
                onChange={(e) => {
                  const val = Number(e.target.value) / 100;
                  void playerController.setVolume(val);
                }}
                className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-primary focus-visible:outline-none"
                aria-label="Ajustar volume"
              />
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

export default FullscreenPlayer;
