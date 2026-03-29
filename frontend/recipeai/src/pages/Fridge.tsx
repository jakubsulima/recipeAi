import { useMemo, useState } from "react";
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
  const [dateError, setDateError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);

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

  const addItem = async () => {
    setError("");

    if (!newItem.trim()) {
      setError("Item name is required");
      return;
    }

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
    } catch (err: any) {
      setError(err?.message || "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this item?"
    );
    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await removeFridgeItem(id);
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
    setError("");
    setIsLoading(true);
    try {
      const productName = await lookupProductByBarcode(barcode);
      if (!productName) {
        setError("Barcode scanned, but no product name was found.");
        return;
      }

      setNewItem(productName);
    } catch {
      setError("Could not fetch product details for this barcode.");
    } finally {
      setIsLoading(false);
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
      <div className="container mx-auto grid min-h-screen grid-cols-1 items-start gap-8 bg-background p-6 md:grid-cols-3">
        <div className="w-full space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              onClick={() => setIsBarcodeScannerOpen(true)}
              className="rounded-md border border-primary/20 bg-secondary px-3 py-2 text-sm font-semibold text-text hover:bg-secondary/80"
            >
              Scan Barcode
            </button>
            <button
              onClick={() => setIsReceiptScannerOpen(true)}
              className="rounded-md border border-primary/20 bg-secondary px-3 py-2 text-sm font-semibold text-text hover:bg-secondary/80"
            >
              Scan Receipt
            </button>
            <button
              onClick={generateZeroWasteRecipe}
              className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-background hover:bg-primary/90"
            >
              Use Expiring Soon
            </button>
          </div>

          <AddFridgeItemForm
            newItem={newItem}
            setNewItem={setNewItem}
            newItemDate={newItemDate}
            handleDateChange={handleDateChange}
            unit={unit}
            setUnit={setUnit}
            amount={amount}
            setAmount={setAmount}
            addItem={addItem}
            error={displayError}
            dateError={dateError}
            displayLoading={displayLoading}
          />
        </div>

        <FridgeDisplay
          fridgeItems={fridgeItems}
          removeItem={removeItem}
          updateAmount={updateAmount}
          error={displayError}
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
