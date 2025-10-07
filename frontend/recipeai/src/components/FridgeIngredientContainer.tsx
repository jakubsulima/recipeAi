import { useState } from "react";
import { unitType } from "../context/fridgeContext";

interface Props {
  id: number;
  name: string;
  expirationDate: string;
  remove: () => void;
  unit: unitType;
  amount?: string;
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
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(amount || "1");
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
    setEditAmount(amount || "1");
    setIsEditing(false);
  };

  return (
    <div className="flex w-full items-center justify-between border-b border-primary/20 py-4 group">
      <div className="flex flex-col flex-1">
        <h1 className="font-semibold text-text">{name}</h1>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="w-20 px-2 py-1 rounded-lg border border-primary/20 bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              min="0"
              step="0.1"
              autoFocus
            />
            <span className="text-sm text-text/70">{unit}</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="ml-2 px-3 py-1 bg-accent hover:bg-accent/90 text-primary rounded-full text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSaving ? "..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-text rounded-full text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-row text-sm text-text/70 items-center gap-2">
            <p>
              {amount} {unit}
              {expirationDate && (
                <span className="ml-2 border-l border-primary/20 pl-2">
                  {expirationDate}
                </span>
              )}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-accent hover:text-accent/80 transition-all"
              aria-label={`Edit amount for ${name}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
            </button>
          </div>
        )}
      </div>
      <button
        className="text-text/50 hover:text-accent text-2xl font-light transition-colors ml-2"
        onClick={remove}
        aria-label={`Remove ${name}`}
      >
        &times;
      </button>
    </div>
  );
};

export default FridgeIngredientContainer;
