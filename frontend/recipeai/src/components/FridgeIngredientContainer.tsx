import { useState } from "react";
import { unitType } from "../context/fridgeContext";

interface Props {
  id: number;
  name: string;
  expirationDate: string;
  remove: () => void;
  unit: unitType;
  amount?: string | number;
  onUpdateAmount: (id: number, newAmount: string) => Promise<void>;
}

const FridgeIngredientContainer = ({
  id,
  name,
  expirationDate,
  unit,
  amount,
  remove,
  onUpdateAmount,
}: Props) => {
  const normalizedAmount = amount == null ? "" : String(amount);
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(normalizedAmount || "1");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editAmount.trim()) {
      return;
    }

    const numericAmount = parseFloat(editAmount);

    // If amount is 0, delete the item
    if (numericAmount === 0) {
      setIsSaving(true);
      try {
        await remove();
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to delete item:", error);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Don't allow negative amounts
    if (numericAmount < 0) {
      return;
    }

    setIsSaving(true);
    try {
      await onUpdateAmount(id, editAmount);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update amount:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditAmount(normalizedAmount || "1");
    setIsEditing(false);
  };

  const amountLabel = normalizedAmount.trim()
    ? `${normalizedAmount} ${unit || ""}`.trim()
    : "No amount";

  return (
    <div className="group w-full rounded-xl border border-primary/10 bg-background p-3.5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-center min-h-[4rem]">
      {!isEditing ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <h1 className="font-semibold text-text truncate leading-tight">
              {name}
            </h1>
            <div className="flex flex-wrap text-[11px] text-text/70 items-center gap-1.5 mt-1">
              <button
                onClick={() => setIsEditing(true)}
                className="hover:text-accent transition-colors flex items-center gap-1"
                aria-label={`Edit amount for ${name}`}
                title="Edit amount"
              >
                <span className="px-2 py-0.5 rounded-full bg-secondary border border-primary/10 hover:bg-primary/5 hover:border-primary/20 transition-all font-medium flex items-center cursor-pointer">
                  {amountLabel}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 ml-1 opacity-70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </span>
              </button>
              {expirationDate && (
                <span className="px-2 py-0.5 rounded-full bg-secondary border border-primary/10">
                  Exp: {expirationDate}
                </span>
              )}
            </div>
          </div>

          <button
            className="text-text/30 hover:text-error text-lg leading-none transition-colors p-1.5 rounded-md hover:bg-error/10 flex-shrink-0"
            onClick={remove}
            aria-label={`Remove ${name}`}
            title="Remove item"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 h-full">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-16 px-2 py-1 rounded-lg border border-primary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium"
              min="0"
              step="0.1"
              autoFocus
            />
            <span className="text-xs font-semibold text-text/70">{unit}</span>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 rounded-md bg-accent/20 text-accent hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
              aria-label="Save"
              title="Save"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="p-1.5 rounded-md bg-secondary text-text/60 hover:bg-error/10 hover:text-error transition-colors"
              aria-label="Cancel"
              title="Cancel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FridgeIngredientContainer;
