import { useState } from "react";
import FridgeIngredientContainer from "../components/FridgeIngredientContainer";
import { CATEGORY_VALUES, unitType, useFridge } from "../context/fridgeContext";
import OptionsForm from "../components/OptionsForm";
import { formatDateForBackend } from "../lib/hooks";
import { categoryType } from "../context/fridgeContext";

export const Fridge = () => {
  const {
    fridgeItems,
    loading: contextLoading,
    error: contextError,
    addFridgeItem,
    removeFridgeItem,
  } = useFridge();
  const [newItem, setNewItem] = useState<string>("");
  const [newItemDate, setNewItemDate] = useState<string>("");
  const [unit, setUnit] = useState<unitType>("kg");
  const [categories, setCategory] = useState<categoryType>("FRIDGE");
  const [amount, setAmount] = useState<string>("1");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isValidNumber = (value: string): boolean => {
    if (value.trim() === "") return false;

    const numberRegex = /^[0-9]*\.?[0-9]+$/;

    if (!numberRegex.test(value.trim())) return false;

    const num = parseFloat(value.trim());
    return !isNaN(num) && num > 0;
  };

  const hasAmountError = (): boolean => {
    return amount.trim() !== "" && !isValidNumber(amount);
  };

  const addItem = async () => {
    setError("");

    if (!newItem.trim()) {
      setError("Item name is required");
      return;
    }

    if (!isValidNumber(amount)) {
      setError("Amount must be a valid positive number");
      return;
    }

    if (newItemDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(newItemDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError("Expiration date cannot be in the past");
        return;
      }
    }

    setIsLoading(true);
    try {
      const formattedDate = newItemDate
        ? formatDateForBackend(newItemDate)
        : null;

      await addFridgeItem({
        name: newItem.trim(),
        expirationDate: formattedDate,
        unit: unit,
        amount: amount,
      });

      setNewItem("");
      setNewItemDate("");
      setAmount("1");
    } catch (err: any) {
      const errorMsg =
        typeof err === "object" && err !== null && "message" in err
          ? (err as any).message
          : String(err) || "Failed to add item";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this item?"
    );
    if (!confirmed) return;

    setIsLoading(true);
    setError("");
    try {
      await removeFridgeItem(id);
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || contextError;
  const displayLoading = isLoading || contextLoading;

  return (
    <>
      <div className="container mx-auto p-6 grid md:grid-cols-2 gap-8">
        <div className="w-full p-6 bg-white rounded-lg shadow-md h-fit">
          <h1 className="text-2xl font-bold mb-4">Add to Fridge</h1>
          <div className="mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add new item *"
              className={`border rounded p-2 w-full mb-2 ${
                error && !newItem.trim() ? "border-red-500" : "border-gray-300"
              }`}
              disabled={displayLoading}
              required
            />
            <label className="block mb-1 text-sm text-gray-600">
              Expiration date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={newItemDate}
              onChange={(e) => setNewItemDate(e.target.value)}
              className={`border rounded p-2 w-full mb-2`}
              disabled={displayLoading}
            />
            <OptionsForm
              name="Unit"
              options={["g", "kg", "ml", "l", "pcs", ""]}
              currentOptions={unit}
              onChange={(value) => setUnit(value as unitType)}
              classname="mb-2"
            />
            <OptionsForm
              name="Category"
              options={CATEGORY_VALUES}
              currentOptions={categories}
              onChange={(value) => setCategory(value as categoryType)}
              classname="mb-2"
            />
            <label className="block mb-1 text-sm text-gray-600"></label>
            Amount <span className="text-gray-400">(optional)</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (e.g., 1.5)"
              className={`border rounded p-2 w-full mb-2 ${
                hasAmountError() ? "border-red-500" : "border-gray-300"
              }`}
              disabled={displayLoading}
              required
            />
            {hasAmountError() && (
              <p className="text-red-500 text-sm mb-2">
                Please enter a valid positive number
              </p>
            )}
            <button
              onClick={() => addItem()}
              disabled={displayLoading || hasAmountError() || !amount.trim()}
              className="mt-2 bg-main text-black px-4 py-2 rounded w-full hover:bg-yellow-400 disabled:opacity-50"
            >
              {displayLoading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </div>

        <div className="w-full p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">My Fridge</h1>
          {displayError && (
            <div className="text-red-500 mb-4">{displayError}</div>
          )}
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {fridgeItems.map((item) => (
              <li key={item.id}>
                <FridgeIngredientContainer
                  name={item.name}
                  expirationDate={item.expirationDate || ""}
                  amount={item.amount || ""}
                  unit={item.unit}
                  remove={() => removeItem(item.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
