import { useEffect, useRef, useState, type CSSProperties } from "react";

interface ErrorAlertProps {
  message?: string | null;
  className?: string;
  compact?: boolean;
  autoHideMs?: number;
  onAutoHide?: () => void;
}

const EXIT_ANIMATION_MS = 220;

const ErrorAlert = ({
  message,
  className = "",
  compact = false,
  autoHideMs = 6000,
  onAutoHide,
}: ErrorAlertProps) => {
  const [isVisible, setIsVisible] = useState(Boolean(message));
  const [isExiting, setIsExiting] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (!message) {
      setIsVisible(false);
      setIsExiting(false);
      return;
    }

    setIsVisible(true);
    setIsExiting(false);

    if (autoHideMs <= 0) {
      return;
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsExiting(true);
      exitTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        onAutoHide?.();
      }, EXIT_ANIMATION_MS);
    }, autoHideMs);

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [message, autoHideMs, onAutoHide]);

  if (!message || !isVisible) {
    return null;
  }

  const sizeClasses = compact
    ? "gap-2 rounded-lg px-3 py-2 text-sm"
    : "gap-2 rounded-xl px-4 py-3 text-sm";
  const iconSizeClasses = compact ? "h-4 w-4 text-[10px]" : "h-5 w-5 text-xs";
  const stateAnimationClass = isExiting ? "error-alert-exit" : "error-alert-enter";

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{ "--error-hide-ms": `${autoHideMs}ms` } as CSSProperties}
      className={`error-alert relative flex items-start border border-accent/45 bg-accent/10 text-text ${sizeClasses} ${stateAnimationClass} ${className}`.trim()}
    >
      <span
        className={`mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-background ${iconSizeClasses}`}
      >
        !
      </span>
      <span>{message}</span>
      <span className="error-alert-progress" aria-hidden="true" />
    </div>
  );
};

export default ErrorAlert;
