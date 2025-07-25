import { useEffect, useState } from "react";
import FridgeIngredientContainer from "../components/FridgeIngredientContainer";
import { useFridge } from "../context/fridgeContext";

const formatDateForBackend = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    // Invalid date string
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

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
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addItem = async () => {
    setError("");

    if (!newItem.trim()) {
      setError("Item name is required");
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
      });

      setNewItem("");
      setNewItemDate("");
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
              className={`border rounded p-2 w-full mb-2 `}
              disabled={displayLoading}
            />
            <button
              onClick={() => addItem()}
              disabled={displayLoading}
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
