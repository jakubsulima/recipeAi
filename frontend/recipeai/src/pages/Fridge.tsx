import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_OPTIONS,
  CATEGORY_VALUES, // Import CATEGORY_VALUES
  unitType,
  useFridge,
} from "../context/fridgeContext";
import { formatDateForBackend } from "../lib/hooks";
import { categoryType } from "../context/fridgeContext";
import AddFridgeItemForm from "../components/AddFridgeItemForm";
import FridgeDisplay from "../components/FridgeDisplay";

export const Fridge = () => {
  const {
    fridgeItems,
    loading: contextLoading,
    error: contextError,
    addFridgeItem,
    removeFridgeItem,
    updateFridgeItem,
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

  // Create a display-friendly version of the category names
  const categoryDisplayOptions = CATEGORY_VALUES.map(
    (cat) => cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()
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

  const updateAmount = async (id: number, newAmount: string) => {
    setError("");
    try {
      await updateFridgeItem(id, newAmount);
    } catch (err: any) {
      setError(err.message || "Failed to update item amount");
      throw err; // Re-throw to let the component know it failed
    }
  };

  const displayError = error || contextError;
  const displayLoading = isLoading || contextLoading;

  return (
    <>
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8 bg-background min-h-screen">
        <AddFridgeItemForm
          newItem={newItem}
          setNewItem={setNewItem}
          newItemDate={newItemDate}
          handleDateChange={handleDateChange}
          unit={unit}
          setUnit={setUnit}
          category={category}
          setCategory={setCategory}
          amount={amount}
          setAmount={setAmount}
          addItem={addItem}
          error={displayError}
          dateError={dateError}
          displayLoading={displayLoading}
          categoryDisplayOptions={categoryDisplayOptions} // Pass the new prop here
        />

        <FridgeDisplay
          fridgeItems={fridgeItems}
          showedCategory={showedCategory}
          goToPreviousCategory={goToPreviousCategory}
          goToNextCategory={goToNextCategory}
          removeItem={removeItem}
          updateAmount={updateAmount}
          error={displayError}
        />
      </div>
    </>
  );
};
