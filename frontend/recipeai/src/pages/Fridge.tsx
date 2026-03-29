import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AddFridgeIngredientInput,
  unitType,
  useFridge,
} from "../context/fridgeContext";
import { formatDateForBackend, lookupProductByBarcode } from "../lib/hooks";
import AddFridgeItemForm from "../components/AddFridgeItemForm";
import FridgeDisplay from "../components/FridgeDisplay";
import BarcodeScanner from "../components/BarcodeScanner";
import ReceiptScanner from "../components/ReceiptScanner";
import ErrorAlert from "../components/ErrorAlert";

const parseBackendDate = (dateString: string) => {
  const [day, month, year] = dateString.split("-");
  return new Date(`${year}-${month}-${day}`);
};

export const Fridge = () => {
  const navigate = useNavigate();
  const {
    fridgeItems,
    loading: contextLoading,
    error: contextError,
    addFridgeItem,
    addFridgeItemsBatch,
    removeFridgeItem,
    updateFridgeItem,
  } = useFridge();

  const [newItem, setNewItem] = useState<string>("");
  const [newItemDate, setNewItemDate] = useState<string>("");
  const [unit, setUnit] = useState<unitType>("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showNameError, setShowNameError] = useState(false);
  const [dateError, setDateError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const isBarcodeAddInFlight = useRef(false);

  const expiringSoonNames = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 3);

    return fridgeItems
      .filter((item) => {
        if (!item.expirationDate) {
          return false;
        }
        const expDate = parseBackendDate(item.expirationDate);
        expDate.setHours(0, 0, 0, 0);
        return expDate >= today && expDate <= maxDate;
      })
      .map((item) => item.name);
  }, [fridgeItems]);

  const validateDate = (dateString: string) => {
    if (!dateString) {
      setDateError("");
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setDateError("Expiration date cannot be in the past");
      return false;
    }

    setDateError("");
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setNewItemDate(newDate);
    validateDate(newDate);
  };

  const handleNewItemChange = (value: string) => {
    setNewItem(value);
    if (showNameError && value.trim()) {
      setShowNameError(false);
    }
  };

  const addItem = async () => {
    setError("");

    if (!newItem.trim()) {
      setError("Item name is required");
      setShowNameError(true);
      return;
    }

    setShowNameError(false);

    if (!validateDate(newItemDate)) {
      return;
    }

    setIsLoading(true);
    try {
      const formattedDate = newItemDate ? formatDateForBackend(newItemDate) : null;

      await addFridgeItem({
        name: newItem.trim(),
        expirationDate: formattedDate,
        unit,
        amount,
      });

      setNewItem("");
      setNewItemDate("");
      setAmount("");
      setUnit("");
      setDateError("");
      setShowNameError(false);
    } catch (err: any) {
      setError(err?.message || "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    setIsLoading(true);
    setError("");
    try {
      await removeFridgeItem(id);
      setError("Ingredient deleted.");
    } catch (err: any) {
      setError(err?.message || "Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const updateAmount = async (id: number, newAmount: string) => {
    setError("");
    try {
      await updateFridgeItem(id, newAmount);
    } catch (err: any) {
      setError(err?.message || "Failed to update item amount");
      throw err;
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    if (isBarcodeAddInFlight.current) {
      return;
    }

    isBarcodeAddInFlight.current = true;
    setError("");
    setIsLoading(true);
    try {
      const productName = await lookupProductByBarcode(barcode);
      if (!productName) {
        setError("Barcode scanned, but no product name was found.");
        return;
      }

      await addFridgeItem({
        name: productName,
        expirationDate: null,
        unit: "",
        amount: "",
      });
    } catch (err: any) {
      setError(err?.message || "Could not fetch product details for this barcode.");
    } finally {
      setIsLoading(false);
      isBarcodeAddInFlight.current = false;
    }
  };

  const handleScannedReceiptItems = async (items: AddFridgeIngredientInput[]) => {
    if (items.length === 0) {
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      await addFridgeItemsBatch(items);
    } catch (err: any) {
      setError(err?.message || "Could not add scanned receipt items.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateZeroWasteRecipe = () => {
    if (expiringSoonNames.length === 0) {
      setError("No ingredients are expiring in the next 3 days.");
      return;
    }

    const prompt = `Create a zero-waste recipe that uses these ingredients first: ${expiringSoonNames.join(
      ", "
    )}.`;

    navigate("/Recipe", {
      state: {
        search: prompt,
      },
    });
  };

  const displayError = error || contextError;
  const displayLoading = isLoading || contextLoading;

  return (
    <>
      <div className="mobile-page-enter container mx-auto grid min-h-screen grid-cols-1 items-start gap-8 bg-background p-6 md:grid-cols-3">
        <div className="w-full space-y-3">
          <ErrorAlert message={displayError} onAutoHide={() => setError("")} />

          <div className="ambient-gradient-card grid grid-cols-1 gap-2 rounded-xl border border-accent/30 bg-accent/10 p-2 sm:grid-cols-3">
            <button
              onClick={() => setIsBarcodeScannerOpen(true)}
              className="mobile-soft-press rounded-md border border-accent/35 bg-background px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-accent/20"
            >
              Scan Barcode
            </button>
            <button
              onClick={() => setIsReceiptScannerOpen(true)}
              className="mobile-soft-press rounded-md border border-accent/35 bg-background px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-accent/20"
            >
              Scan Receipt
            </button>
            <button
              onClick={generateZeroWasteRecipe}
              className="mobile-soft-press rounded-md bg-accent px-3 py-2 text-sm font-semibold text-text shadow-[0_8px_18px_rgba(255,212,60,0.3)] transition-colors hover:bg-accent/90"
            >
              Use Expiring Soon
            </button>
          </div>

          <AddFridgeItemForm
            newItem={newItem}
            setNewItem={handleNewItemChange}
            newItemDate={newItemDate}
            handleDateChange={handleDateChange}
            unit={unit}
            setUnit={setUnit}
            amount={amount}
            setAmount={setAmount}
            addItem={addItem}
            showNameError={showNameError}
            dateError={dateError}
            displayLoading={displayLoading}
          />
        </div>

        <FridgeDisplay
          fridgeItems={fridgeItems}
          removeItem={removeItem}
          updateAmount={updateAmount}
        />
      </div>

      <BarcodeScanner
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onBarcodeDetected={handleBarcodeDetected}
      />

      <ReceiptScanner
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onConfirm={handleScannedReceiptItems}
      />
    </>
  );
};
