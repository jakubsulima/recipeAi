import React from "react";
import { FridgeIngredient } from "../context/fridgeContext";
import FridgeIngredientContainer from "./FridgeIngredientContainer";

interface FridgeDisplayProps {
  fridgeItems: FridgeIngredient[];
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
  removeItem,
  updateAmount,
  error,
}) => {
  const sortedItems = [...fridgeItems].sort((a, b) => {
    if (!a.expirationDate && !b.expirationDate) {
      return a.name.localeCompare(b.name);
    }
    if (!a.expirationDate) {
      return 1;
    }
    if (!b.expirationDate) {
      return -1;
    }

    const [aDay, aMonth, aYear] = a.expirationDate.split("-");
    const [bDay, bMonth, bYear] = b.expirationDate.split("-");
    const aDate = new Date(`${aYear}-${aMonth}-${aDay}`).getTime();
    const bDate = new Date(`${bYear}-${bMonth}-${bDay}`).getTime();
    return aDate - bDate;
  });

  return (
    <div className="md:col-span-2 w-full p-5 sm:p-6 bg-secondary rounded-xl shadow-sm border border-primary/5 min-h-[500px] flex flex-col">
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-accent/45 bg-accent/10 px-3 py-3 text-sm text-text shadow-sm">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
            !
          </span>
          <span>{error}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-text">My Fridge</h1>
        <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-accent/20 border border-accent/35 text-text">
          {sortedItems.length} item{sortedItems.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-1">
        {sortedItems.map((item: FridgeIngredient) => (
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
      {sortedItems.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-primary/20 rounded-xl py-12 mt-2 mb-2 bg-background/60">
          <svg className="w-12 h-12 text-primary/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-text/70 font-medium text-lg">No ingredients in your inventory</p>
          <p className="text-text/50 text-sm mt-2 max-w-[250px] mx-auto">
            Add your first ingredient to start tracking what you have at home
          </p>
        </div>
      )}
    </div>
  );
};

export default FridgeDisplay;
