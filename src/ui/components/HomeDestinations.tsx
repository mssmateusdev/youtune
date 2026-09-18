import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ClockIcon, CompassIcon, DownloadIcon, PlaylistIcon } from "@/ui/icons";
import { useOfflineState } from "../../player/offlineStore";
import { usePlayHistory } from "../../player/playHistory";
import { useLibraryState } from "../../player/playerStore";

export interface HomeDestinationHandlers {
  onOpenLibrary: () => void;
  onOpenBrowse: () => void;
  onOpenHistory: () => void;
  onOpenDownloads: () => void;
}

/**
 * The app's four destinations, on the home page rather than in the rail.
 */
export function HomeDestinations({
  onOpenLibrary,
  onOpenBrowse,
  onOpenHistory,
  onOpenDownloads,
}: HomeDestinationHandlers) {
  const libraryState = useLibraryState();
  const offline = useOfflineState();
  const history = usePlayHistory();

  const library = libraryState.library;
  const savedCount = (library?.playlists.length ?? 0) + (library?.albums.length ?? 0);
  const downloadCount = Object.keys(offline.entries).length;

  const cards = [
    {
      key: "library",
      label: "Biblioteca",
      hint: "Músicas, álbuns, artistas",
      icon: PlaylistIcon,
      onClick: onOpenLibrary,
      badge: savedCount > 0 ? `${savedCount} salvos` : undefined,
    },
    {
      key: "browse",
      label: "Explorar",
      hint: "Paradas, estilos, podcasts",
      icon: CompassIcon,
      onClick: onOpenBrowse,
    },
    {
      key: "history",
      label: "Histórico",
      hint: "Tudo o que você ouviu",
      icon: ClockIcon,
      onClick: onOpenHistory,
      badge: history.length > 0 ? `${history.length} músicas ouvidas` : undefined,
    },
    {
      key: "downloads",
      label: "Downloads",
      hint: "Salvos para ouvir offline",
      icon: DownloadIcon,
      onClick: onOpenDownloads,
      badge: offline.downloadingId
        ? offline.progress !== null
          ? `${offline.progress}%`
          : "baixando"
        : downloadCount > 0
          ? `${downloadCount} músicas`
          : undefined,
    },
  ];

  return (
    <section className="flex flex-col gap-3" aria-label="Navegar para">
      <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))]">
        {cards.map((card) => (
          <motion.button
            key={card.key}
            type="button"
            onClick={card.onClick}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            className={cn(
              "group/dest flex items-center gap-3.5 rounded-xl border border-border/80 bg-card/70 p-3 text-left",
              "transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-md",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-200 group-hover/dest:bg-primary group-hover/dest:text-primary-foreground">
              <card.icon size={20} strokeWidth={2} aria-hidden="true" />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <span className="truncate text-sm font-semibold leading-tight text-foreground transition-colors group-hover/dest:text-primary">
                {card.label}
              </span>
              {card.badge ? (
                <span className="truncate text-xs font-medium tabular-nums text-primary/90">
                  {card.badge}
                </span>
              ) : (
                <span className="truncate text-xs text-muted-foreground">{card.hint}</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
