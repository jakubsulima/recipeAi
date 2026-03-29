import { useState } from "react";
import axios from "axios";
import {
  AddFridgeIngredientInput,
  UNIT_OPTIONS,
  unitType,
} from "../context/fridgeContext";
import { API_URL } from "../lib/constants";

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: AddFridgeIngredientInput[]) => Promise<void>;
}

interface DetectedReceiptItem {
  name?: string;
  amount?: number | string | null;
  unit?: string | null;
}

interface EditableReceiptItem {
  id: string;
  selected: boolean;
  name: string;
  amount: string;
  unit: unitType;
}

const toUnitType = (value?: string | null): unitType => {
  if (!value) {
    return "";
  }

  const normalized = value.trim().toLowerCase();
  if (UNIT_OPTIONS.includes(normalized as unitType)) {
    return normalized as unitType;
  }

  const enumToAbbreviation: Record<string, unitType> = {
    grams: "g",
    kilograms: "kg",
    milliliters: "ml",
    liters: "l",
    pieces: "pcs",
  };

  return enumToAbbreviation[normalized] ?? "";
};

const ReceiptScanner = ({ isOpen, onClose, onConfirm }: ReceiptScannerProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<EditableReceiptItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const scanReceipt = async () => {
    setError("");
    if (!file) {
      setError("Select a receipt image first.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}scanFridgeReceipt`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const detectedItems = Array.isArray(response.data)
        ? (response.data as DetectedReceiptItem[])
        : [];

      const editableItems: EditableReceiptItem[] = detectedItems
        .filter((item) => item?.name && item.name.trim() !== "")
        .map((item, index) => ({
          id: `${Date.now()}-${index}`,
          selected: true,
          name: item.name!.trim(),
          amount:
            item.amount === null || item.amount === undefined
              ? ""
              : String(item.amount),
          unit: toUnitType(item.unit),
        }));

      if (editableItems.length === 0) {
        setError(
          "No food ingredients were detected on this receipt. Try another photo with better lighting."
        );
      }

      setItems(editableItems);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to scan receipt image.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateItem = (
    id: string,
    updates: Partial<Omit<EditableReceiptItem, "id">>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const addSelectedItems = async () => {
    setError("");

    const invalidAmountItem = items.find((item) => {
      if (!item.selected) {
        return false;
      }
      const normalizedAmount = item.amount.trim();
      if (!normalizedAmount) {
        return false;
      }
      const parsed = Number(normalizedAmount);
      return Number.isNaN(parsed) || parsed <= 0;
    });

    if (invalidAmountItem) {
      setError(`Invalid amount for \"${invalidAmountItem.name}\". Use a positive number.`);
      return;
    }

    const selected = items
      .filter((item) => item.selected && item.name.trim() !== "")
      .map((item) => {
        const normalizedAmount = item.amount.trim();
        return {
          name: item.name.trim(),
          expirationDate: null,
          amount: normalizedAmount ? normalizedAmount : undefined,
          unit: item.unit,
        } satisfies AddFridgeIngredientInput;
      });

    if (selected.length === 0) {
      setError("Select at least one valid item to add.");
      return;
    }

    try {
      await onConfirm(selected);
      setFile(null);
      setItems([]);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Could not add scanned items.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-primary/20 bg-secondary p-4 sm:p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text">Scan Receipt</h3>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-text/70 hover:bg-background"
          >
            Close
          </button>
        </div>

        <div className="rounded-lg border border-primary/15 bg-background p-4">
          <label className="mb-2 block text-sm font-medium text-text">
            Upload receipt image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-text"
          />
          <button
            onClick={scanReceipt}
            disabled={isUploading}
            className="mt-3 rounded-md bg-accent px-4 py-2 font-semibold text-text hover:bg-accent/90 disabled:opacity-60"
          >
            {isUploading ? "Scanning..." : "Scan Receipt"}
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        {items.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-lg border border-primary/15">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-background text-left text-text/80">
                <tr>
                  <th className="p-2">Add</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Unit</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-primary/10">
                    <td className="p-2 align-middle">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={(e) =>
                          updateItem(item.id, { selected: e.target.checked })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, { name: e.target.value })
                        }
                        className="w-full rounded border border-primary/20 bg-background px-2 py-1 text-text"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={item.amount}
                        onChange={(e) =>
                          updateItem(item.id, { amount: e.target.value })
                        }
                        placeholder="optional"
                        className="w-full rounded border border-primary/20 bg-background px-2 py-1 text-text"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(item.id, {
                            unit: e.target.value as unitType,
                          })
                        }
                        className="w-full rounded border border-primary/20 bg-background px-2 py-1 text-text"
                      >
                        <option value="">none</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-primary/10 bg-background p-3">
              <button
                onClick={addSelectedItems}
                className="rounded-md bg-primary px-4 py-2 font-semibold text-background hover:bg-primary/90"
              >
                Add Selected To Inventory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
