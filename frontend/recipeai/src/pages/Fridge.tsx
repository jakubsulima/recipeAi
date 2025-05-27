import { useState } from "react";
import FridgeIngredientContainer from "../components/FridgeIngredientContainer";
import { useFridge } from "../context/fridgeContext";

// Date formatting utility functions
const formatDateForBackend = (dateString: string): string => {
  const date = new Date(dateString);

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
    // Clear previous errors
    setError("");

    // Validate required fields
    if (!newItem.trim()) {
      setError("Item name is required");
      return;
    }

    if (!newItemDate) {
      setError("Expiration date is required");
      return;
    }

    // Check if date is in the past
    const selectedDate = new Date(newItemDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (selectedDate < today) {
      setError("Expiration date cannot be in the past");
      return;
    }

    setIsLoading(true);
    try {
      // Format the date before sending to backend
      const formattedDate = formatDateForBackend(newItemDate);

      await addFridgeItem({
        name: newItem.trim(),
        expirationDate: formattedDate,
      });

      setNewItem("");
      setNewItemDate("");
    } catch (err: any) {
      setError(err.message || "Failed to add item");
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (id: number) => {
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

  // Use context error if no local error
  const displayError = error || contextError;
  const displayLoading = isLoading || contextLoading;
  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">My Fridge</h1>
          {displayError && (
            <div className="text-red-500 mb-4">{displayError}</div>
          )}
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
            <input
              type="date"
              value={newItemDate}
              onChange={(e) => setNewItemDate(e.target.value)}
              className={`border rounded p-2 w-full mb-2 ${
                error && !newItemDate ? "border-red-500" : "border-gray-300"
              }`}
              disabled={displayLoading}
              required
            />
            <button
              onClick={() => addItem()}
              disabled={displayLoading}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 disabled:opacity-50"
            >
              {displayLoading ? "Adding..." : "Add Item"}
            </button>
          </div>
          <ul className="space-y-2">
            {fridgeItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center">
                <FridgeIngredientContainer
                  name={item.name}
                  expirationDate={item.expirationDate}
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
