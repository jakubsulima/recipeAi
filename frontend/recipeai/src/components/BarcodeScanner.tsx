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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl border border-primary/20 bg-secondary p-4 sm:p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text">Scan Barcode</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-text/70 hover:bg-background"
          >
            Close
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-primary/15 bg-background">
          <video
            ref={videoRef}
            className="h-64 w-full object-cover"
            autoPlay
            muted
            playsInline
          />
        </div>

        {isStarting && (
          <p className="mt-3 text-sm text-text/70">Starting camera...</p>
        )}

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        <div className="mt-4 border-t border-primary/10 pt-4">
          <label className="mb-1 block text-sm font-medium text-text">
            Or enter barcode manually
          </label>
          <div className="flex gap-2">
            <input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="e.g. 5901234123457"
              className="w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-text"
            />
            <button
              onClick={handleManualSubmit}
              className="rounded-md bg-accent px-4 py-2 font-semibold text-text hover:bg-accent/90"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
