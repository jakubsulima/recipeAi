import React from "react";
import { hasAmountError } from "../lib/hooks";
import OptionsForm from "./OptionsForm";
import {
  unitType,
  categoryType,
  CATEGORY_VALUES,
} from "../context/fridgeContext";

interface AddFridgeItemFormProps {
  newItem: string;
  setNewItem: (value: string) => void;
  newItemDate: string;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit: unitType;
  setUnit: (value: unitType) => void;
  category: categoryType;
  setCategory: (value: categoryType) => void;
  amount: string;
  setAmount: (value: string) => void;
  addItem: () => void;
  error: string;
  dateError: string;
  displayLoading: boolean;
  categoryDisplayOptions: string[]; // New prop for display names
}

const AddFridgeItemForm: React.FC<AddFridgeItemFormProps> = ({
  newItem,
  setNewItem,
  newItemDate,
  handleDateChange,
  unit,
  setUnit,
  category,
  setCategory,
  amount,
  setAmount,
  addItem,
  error,
  dateError,
  displayLoading,
  categoryDisplayOptions,
}) => {
  return (
    <div className="w-full p-5 sm:p-6 bg-secondary rounded-lg shadow-sm border border-primary/5 h-fit">
      {error && (
        <div className="bg-error/10 border-t-4 border-error text-error p-3 mb-6 rounded-r-md text-sm font-medium shadow-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-text">Add to Fridge</h2>
      
      <div className="flex flex-col gap-4">
        {/* Item Name */}
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-text">
            Item name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="e.g., Tomatoes"
            className={`appearance-none border rounded-md p-2.5 w-full bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent transition-shadow shadow-sm ${
              error && !newItem.trim() ? "border-error" : "border-primary/20"
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
            disabled={displayLoading}
            required
          />
        </div>

        {/* Expiration Date */}
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-text mt-1">
            Expiration date <span className="text-text/50 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={newItemDate}
            onChange={handleDateChange}
            className={`appearance-none border rounded-md p-2.5 w-full bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent transition-shadow shadow-sm ${
              dateError ? "border-error focus:ring-error" : "border-primary/20"
            }`}
            style={{ WebkitTapHighlightColor: "transparent" }}
            disabled={displayLoading}
          />
          {dateError && <p className="text-error text-xs mt-1 font-medium">{dateError}</p>}
        </div>

        {/* Category */}
        <div className="mt-1">
          <OptionsForm
            label="Category"
            name="Category"
            options={CATEGORY_VALUES}
            displayOptions={categoryDisplayOptions}
            currentOptions={category}
            onChange={(value) => setCategory(value as categoryType)}
          />
        </div>

        {/* Unit */}
        <div className="mt-1">
          <OptionsForm
            label="Unit (optional)"
            name="Unit"
            options={["g", "kg", "ml", "l", "pcs"]}
            currentOptions={unit}
            onChange={(value) => {
              setUnit(value as unitType);
              if (!value) {
                setAmount("");
              }
            }}
          />
        </div>

        {/* Amount is only shown after selecting a unit */}
        {unit && (
          <div className="flex flex-col gap-1 mt-1">
            <label className="block text-sm font-medium text-text">
              Amount <span className="text-text/50 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 1.5"
              className={`appearance-none border rounded-md p-2.5 w-full bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent transition-shadow shadow-sm ${
                hasAmountError(amount) ? "border-accent" : "border-primary/20"
              }`}
              style={{ WebkitTapHighlightColor: "transparent" }}
              disabled={displayLoading}
            />
            {hasAmountError(amount) && (
              <p className="text-accent text-xs mt-1">
                Please enter a valid positive number
              </p>
            )}
          </div>
        )}

        <button
          onClick={addItem}
          disabled={
            displayLoading ||
            hasAmountError(amount) ||
            !!dateError
          }
          className="mt-4 bg-accent text-text px-4 py-3 rounded-md font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors shadow-sm"
        >
          {displayLoading ? "Adding..." : "Add Item"}
        </button>
      </div>
    </div>
  );
};

export default AddFridgeItemForm;
