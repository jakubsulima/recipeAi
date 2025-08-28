import { useState } from "react";
import FridgeIngredientContainer from "../components/FridgeIngredientContainer";
import {
  CATEGORIES,
  CATEGORY_OPTIONS,
  CATEGORY_VALUES,
  FridgeIngredient,
  unitType,
  useFridge,
} from "../context/fridgeContext";
import OptionsForm from "../components/OptionsForm";
import { formatDateForBackend, hasAmountError } from "../lib/hooks";
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
  const [category, setCategory] = useState<categoryType>("FRIDGE");
  const [amount, setAmount] = useState<string>("1");
  const [error, setError] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showedCategory, setShowedCategory] = useState<categoryType | null>(
    CATEGORIES.FRIDGE
  );

  const getCurrentCategoryIndex = () => {
    return showedCategory ? CATEGORY_OPTIONS.indexOf(showedCategory) : 0;
  };

  const goToPreviousCategory = () => {
    const currentIndex = getCurrentCategoryIndex();
    const previousIndex =
      currentIndex === 0 ? CATEGORY_OPTIONS.length - 1 : currentIndex - 1;
    setShowedCategory(CATEGORY_OPTIONS[previousIndex]);
  };

  const goToNextCategory = () => {
    const currentIndex = getCurrentCategoryIndex();
    const nextIndex =
      currentIndex === CATEGORY_OPTIONS.length - 1 ? 0 : currentIndex + 1;
    setShowedCategory(CATEGORY_OPTIONS[nextIndex]);
  };

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

  // Handle date input change
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

    // Validate date before submitting
    if (!validateDate(newItemDate)) {
      return;
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
        category: category,
      });

      setNewItem("");
      setNewItemDate("");
      setAmount("1");
      setDateError(""); // Clear date error on success
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
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3">
        <div className="w-full p-6 bg-white rounded-lg shadow-md h-fit">
          {displayError && (
            <div className="text-red-500 mb-4">{displayError}</div>
          )}
          <h1 className="text-2xl font-bold mb-4">Add to Fridge</h1>
          <div className="mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add new item *"
              className={`border rounded p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-highlight ${
                error && !newItem.trim() ? "border-red-500" : "border-gray-300"
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
              disabled={displayLoading}
              required
            />

            <label className="block mb-1 text-sm text-gray-600">
              Expiration date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="date"
              value={newItemDate}
              onChange={handleDateChange}
              className={`border rounded p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-highlight ${
                dateError ? "border-red-500" : "border-gray-300"
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
              disabled={displayLoading}
            />
            {/* Date error message below the date input */}
            {dateError && (
              <p className="text-red-500 text-sm mb-2">{dateError}</p>
            )}

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
              currentOptions={category}
              onChange={(value) => setCategory(value as categoryType)}
              classname="mb-2"
            />
            <label className="block mb-1 text-sm text-gray-600">
              Amount <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (e.g., 1.5)"
              className={`border rounded p-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-highlight focus:border-highlight ${
                hasAmountError(amount) ? "border-red-500" : "border-gray-300"
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
              disabled={displayLoading}
              required
            />
            {hasAmountError(amount) && (
              <p className="text-red-500 text-sm mb-2">
                Please enter a valid positive number
              </p>
            )}
            <button
              onClick={() => addItem()}
              disabled={
                displayLoading ||
                hasAmountError(amount) ||
                !amount.trim() ||
                !!dateError
              }
              className="mt-2 bg-primary text-black px-4 py-2 rounded w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {displayLoading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </div>

        <div
          className="w-full p-6 bg-white rounded-lg shadow-md
        col-span-2"
        >
          <h1 className="text-2xl font-bold mb-4">My Fridge</h1>
          <div className="flex justify-center mb-4">
            {showedCategory && (
              <div className="flex items-center bg-gray-200 rounded-lg">
                <button
                  onClick={goToPreviousCategory}
                  className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-l-lg transition-colors cursor-pointer"
                >
                  &lt;
                </button>

                <div className="px-6 py-2 bg-white w-64 text-center">
                  <h2 className="text-xl font-bold whitespace-nowrap">
                    {showedCategory.replace(/_/g, " ")}
                  </h2>
                </div>

                <button
                  onClick={goToNextCategory}
                  className="flex items-center justify-center w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-r-lg transition-colors cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
          <ul className="grid md:grid-cols-3 gap-4">
            {fridgeItems
              .filter(
                (item: FridgeIngredient) => item.category === showedCategory
              )
              .map((item: FridgeIngredient) => (
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
