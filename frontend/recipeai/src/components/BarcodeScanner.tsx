import { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

interface DetectedBarcode {
  rawValue?: string;
}

interface BarcodeDetectorInstance {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
}

type WindowWithBarcodeDetector = Window & {
  BarcodeDetector?: BarcodeDetectorConstructor;
};

const BarcodeScanner = ({
  isOpen,
  onClose,
  onBarcodeDetected,
}: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const [manualBarcode, setManualBarcode] = useState("");
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const stopScanner = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isCancelled = false;

    const startScanner = async () => {
      setError("");
      setIsStarting(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Your browser does not support camera access.");
        setIsStarting(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const BarcodeDetectorApi = (window as WindowWithBarcodeDetector)
          .BarcodeDetector;

        if (!BarcodeDetectorApi) {
          setError(
            "Live barcode detection is not supported in this browser. You can still enter the code manually."
          );
          return;
        }

        const detector = new BarcodeDetectorApi({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
        });

        timerRef.current = window.setInterval(async () => {
          if (!videoRef.current) {
            return;
          }

          try {
            const results = await detector.detect(videoRef.current);
            const firstMatch = results.find((result) => result.rawValue);
            if (firstMatch?.rawValue) {
              onBarcodeDetected(firstMatch.rawValue);
              onClose();
            }
          } catch {
            // Ignore transient detector errors while frames are warming up.
          }
        }, 600);
      } catch {
        setError(
          "Could not start camera scanner. Please allow camera access or enter barcode manually."
        );
      } finally {
        setIsStarting(false);
      }
    };

    startScanner();

    return () => {
      isCancelled = true;
      stopScanner();
    };
  }, [isOpen, onBarcodeDetected, onClose]);

  const handleManualSubmit = () => {
    const trimmed = manualBarcode.trim();
    if (!trimmed) {
      return;
    }
    onBarcodeDetected(trimmed);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-primary/20 bg-secondary shadow-2xl">
        <div className="border-b border-primary/10 bg-primary px-4 py-3 text-background sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">Scan Barcode</h3>
              <p className="text-sm text-background/75">
                Place the barcode inside the frame for fast detection.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md border border-background/20 px-2.5 py-1.5 text-sm font-medium text-background/80 transition-colors hover:bg-background/10 hover:text-background"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative overflow-hidden rounded-xl border border-primary/15 bg-background">
            <video
              ref={videoRef}
              className="h-64 w-full object-cover sm:h-72"
              autoPlay
              muted
              playsInline
            />
            <div className="pointer-events-none absolute inset-0 p-5">
              <div className="relative h-full w-full rounded-xl border-2 border-accent/75">
                <div className="scanner-sweep absolute left-3 right-3 h-0.5 bg-accent/90 shadow-[0_0_16px_rgba(255,212,60,0.8)]" />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="rounded-full border border-primary/15 bg-background px-3 py-1 text-text/70">
              Supports EAN and UPC formats
            </span>
            {isStarting && (
              <span className="rounded-full bg-accent/20 px-3 py-1 font-medium text-text">
                Starting camera...
              </span>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-sm text-text">
              {error}
            </p>
          )}

          <div className="mt-5 border-t border-primary/10 pt-4">
            <label className="mb-1.5 block text-sm font-medium text-text">
              Enter barcode manually
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                placeholder="e.g. 5901234123457"
                className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-text placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={handleManualSubmit}
                className="rounded-lg bg-accent px-4 py-2.5 font-semibold text-text transition-colors hover:bg-accent/90"
              >
                Use Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
