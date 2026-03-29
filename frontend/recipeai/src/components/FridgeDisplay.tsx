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
  updateAmount: (id: number, newAmount: string) => Promise<void>;
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
  updateAmount,
  error,
}) => {
  const filteredItems = showedCategory
    ? fridgeItems.filter((item) => item.category === showedCategory)
    : [];

  return (
    <div className="md:col-span-2 w-full p-5 sm:p-6 bg-secondary rounded-xl shadow-sm border border-primary/5 min-h-[500px] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-text">My Fridge</h1>
        <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-background border border-primary/10 text-text/70">
          {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"}
        </span>
      </div>
      <CategorySwitcher
        currentCategory={showedCategory}
        onPrevious={goToPreviousCategory}
        onNext={goToNextCategory}
      />
      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-5">
        {filteredItems.map((item: FridgeIngredient) => (
          <li key={item.id}>
            <FridgeIngredientContainer
              id={item.id}
              name={item.name}
              expirationDate={formatShortDate(item.expirationDate)}
              amount={item.amount || ""}
              unit={item.unit}
              remove={() => removeItem(item.id)}
              onUpdateAmount={updateAmount}
            />
          </li>
        ))}
      </ul>
      {filteredItems.length === 0 && showedCategory && (
        <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-primary/20 rounded-xl py-12 mt-2 mb-2 bg-background/60">
          <svg className="w-12 h-12 text-primary/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-text/70 font-medium text-lg">No items in this category</p>
          <p className="text-text/50 text-sm mt-2 max-w-[250px] mx-auto">
            Add your first item here to keep your ingredients organized
          </p>
        </div>
      )}
    </div>
  );
};

export default FridgeDisplay;
