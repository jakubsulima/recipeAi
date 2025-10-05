import React from "react";
import { FridgeIngredient, categoryType } from "../context/fridgeContext";
import CategorySwitcher from "./CategorySwitcher";
import FridgeIngredientContainer from "./FridgeIngredientContainer";

interface FridgeDisplayProps {
  fridgeItems: FridgeIngredient[];
  showedCategory: categoryType | null;
  goToPreviousCategory: () => void;
  goToNextCategory: () => void;
  removeItem: (id: number) => void;
  error: string;
}

const formatShortDate = (dateString: string | null): string => {
  if (!dateString) {
    return "";
  }
  const parts = dateString.split("-");
  if (parts.length === 3 && parts[2].length === 4) {
    const shortYear = parts[2].slice(-2);
    return `${parts[0]}-${parts[1]}-${shortYear}`;
  }
  return dateString;
};

const FridgeDisplay: React.FC<FridgeDisplayProps> = ({
  fridgeItems,
  showedCategory,
  goToPreviousCategory,
  goToNextCategory,
  removeItem,
  error,
}) => {
  const filteredItems = showedCategory
    ? fridgeItems.filter((item) => item.category === showedCategory)
    : [];

  return (
    <div className="md:col-span-2 w-full p-6 bg-secondary rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-text">My Fridge</h1>
      {error && <div className="text-accent mb-4">{error}</div>}
      <CategorySwitcher
        currentCategory={showedCategory}
        onPrevious={goToPreviousCategory}
        onNext={goToNextCategory}
      />
      <ul className="grid md:grid-cols-3 gap-4">
        {filteredItems.map((item: FridgeIngredient) => (
          <li key={item.id}>
            <FridgeIngredientContainer
              name={item.name}
              expirationDate={formatShortDate(item.expirationDate)}
              amount={item.amount || ""}
              unit={item.unit}
              remove={() => removeItem(item.id)}
            />
          </li>
        ))}
      </ul>
      {filteredItems.length === 0 && showedCategory && (
        <div className="text-center text-gray-500 py-8">
          No items in{" "}
          {showedCategory.toLowerCase().charAt(0).toUpperCase() +
            showedCategory.slice(1).toLowerCase().replace(/_/g, " ")}
        </div>
      )}
    </div>
  );
};

export default FridgeDisplay;
