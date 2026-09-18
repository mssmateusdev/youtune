import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/*
 * The accent bloom, as a gradient rather than a blurred circle.
 *
 * It was a 420px solid disc with `blur-[120px]`. A filter that large is not cheap the way a
 * background is: the element becomes its own compositor layer, and Chromium has to allocate an
 * intermediate texture expanded by roughly three times the radius on every side — a 420px disc
 * rasterising into something past 1100px square, in multiple passes, on the startup screen
 * where the GPU process is still warming up.
 *
 * A blurred solid circle is a radial gradient. This one is drawn straight into the raster pass:
 * no filter, no layer, no intermediate. The box is grown to 660px because the gradient has to
 * cover the area the blur used to bleed into.
 */
const LOADING_GLOW =
  "radial-gradient(circle, color-mix(in oklab, var(--color-primary) 7%, transparent) 0%, transparent 70%)";

const LOADING_LINES = [
  "Encontrando seu ritmo...",
  "Carregando sua biblioteca...",
  "Afinando o palco...",
  "Aquecendo as cordas...",
  "Contando os tempos...",
  "Preparando sua sessão...",
  "Sincronizando sua música...",
  "Montando a vibe de hoje...",
];

interface AppLoadingScreenProps {
  isLeaving: boolean;
}

export function AppLoadingScreen({ isLeaving }: AppLoadingScreenProps) {
  const loadingLine = LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center rounded-3xl bg-background transition-opacity duration-200",
        isLeaving ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      role="status"
      aria-label="Carregando"
      aria-live="polite"
    >
      
      {/* Accent bloom behind the mark. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[660px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: LOADING_GLOW }}
      />

      <div className="relative flex flex-col items-center gap-5">
        {/* Animated logo — CSS play button with pulsing ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="relative flex size-20 items-center justify-center"
        >
          {/* Rotating ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "var(--color-primary)",
              borderRightColor: "color-mix(in oklab, var(--color-primary) 30%, transparent)",
              animation: "splash-spin 1.2s linear infinite",
            }}
          />
          {/* Pulsing glow */}
          <div
            className="absolute inset-1 rounded-full"
            style={{
              background: "radial-gradient(circle, color-mix(in oklab, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
              animation: "splash-pulse 2s ease-in-out infinite",
            }}
          />
          {/* Play triangle */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative ml-1 size-8 text-primary"
          >
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <strong className="text-sm font-semibold tracking-wide text-primary">
            YouTune
          </strong>
          <span className="text-xs font-medium text-muted-foreground">
            {loadingLine}
          </span>
        </motion.div>
      </div>

      {/* Keyframes for the CSS animations */}
      <style>{`
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
