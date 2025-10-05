import React from "react";
import { hasAmountError, isValidNumber } from "../lib/hooks";
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
  categoryDisplayOptions, // Use the new prop
}) => {
  return (
    <div className="w-full p-6 bg-secondary rounded-lg shadow-md h-fit">
      {error && <div className="text-accent mb-4">{error}</div>}
      <h1 className="text-2xl font-bold mb-4 text-text">Add to Fridge</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add new item *"
          className={`border rounded p-2 w-full mb-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent ${
            error && !newItem.trim() ? "border-accent" : "border-primary/20"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          disabled={displayLoading}
          required
        />

        <label className="block mb-1 text-sm text-text/70">
          Expiration date <span className="text-text/50">(optional)</span>
        </label>
        <input
          type="date"
          value={newItemDate}
          onChange={handleDateChange}
          className={`border rounded p-2 w-full mb-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent ${
            dateError ? "border-accent" : "border-primary/20"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          disabled={displayLoading}
        />
        {dateError && <p className="text-accent text-sm mb-2">{dateError}</p>}

        <OptionsForm
          label="Category"
          name="Category"
          options={CATEGORY_VALUES}
          displayOptions={categoryDisplayOptions} // Pass display options to the form
          currentOptions={category}
          onChange={(value) => setCategory(value as categoryType)}
          classname="mb-2"
        />
        <label className="block mb-1 text-sm text-text/70">
          Amount <span className="text-text/50">(optional)</span>
        </label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (e.g., 1.5)"
          className={`border rounded p-2 w-full mb-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent ${
            hasAmountError(amount) ? "border-accent" : "border-primary/20"
          }`}
          style={{ WebkitTapHighlightColor: "transparent" }}
          disabled={displayLoading}
          required
        />
        {hasAmountError(amount) && (
          <p className="text-accent text-sm mb-2">
            Please enter a valid positive number
          </p>
        )}
        <OptionsForm
          label="Unit"
          name="Unit"
          options={["g", "kg", "ml", "l", "pcs", ""]}
          currentOptions={unit}
          onChange={(value) => setUnit(value as unitType)}
          classname="mb-2"
        />
        <button
          onClick={addItem}
          disabled={
            displayLoading ||
            hasAmountError(amount) ||
            !amount.trim() ||
            !!dateError
          }
          className="mt-2 bg-accent text-background px-4 py-2 rounded w-full font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
        >
          {displayLoading ? "Adding..." : "Add Item"}
        </button>
      </div>
    </div>
  );
};

export default AddFridgeItemForm;
