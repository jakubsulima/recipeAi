import { useEffect, useMemo, useState } from "react";
import {
  readShoppingList,
  ShoppingListItem,
  writeShoppingList,
} from "../lib/shoppingList";

const ShoppingList = () => {
  const [items, setItems] = useState<ShoppingListItem[]>(() => readShoppingList());
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    writeShoppingList(items);
  }, [items]);

  const remainingCount = useMemo(
    () => items.filter((item) => !item.checked).length,
    [items]
  );

  const addManualItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) {
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmed,
        amount: null,
        unit: null,
        checked: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewItem("");
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearChecked = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const clearAll = () => {
    setItems([]);
  };

  const completedCount = items.length - remainingCount;

  return (
    <div className="mx-auto min-h-screen w-full max-w-4xl bg-background px-4 py-6 sm:px-6">
      <div className="mb-6 overflow-hidden rounded-3xl border border-accent/35 bg-secondary p-6">
        <h1 className="text-3xl font-bold text-text sm:text-4xl">Shopping List</h1>
        <p className="mt-2 text-sm text-text/60 sm:text-base">
          Keep your next recipe run organized and check items as you shop.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-text">
            {remainingCount} left
          </span>
          <span className="rounded-full border border-accent/35 bg-background px-3 py-1.5 text-sm text-text/75">
            {completedCount} completed
          </span>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-primary/10 bg-secondary p-4 sm:p-5">
        <label className="mb-2 block text-sm font-medium text-text">
          Add item manually
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addManualItem();
              }
            }}
            placeholder="e.g. Tomatoes"
            className="w-full rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-text placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={addManualItem}
            className="rounded-lg bg-accent px-4 py-2.5 font-semibold text-text shadow-[0_10px_22px_rgba(255,212,60,0.28)] transition-colors hover:bg-accent/90"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/10 bg-secondary p-4 sm:p-5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-accent/35 bg-background px-4 py-8 text-center">
            <p className="font-medium text-text/80">Your shopping list is empty.</p>
            <p className="mt-1 text-sm text-text/60">Add items above or generate a list from a recipe.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-background px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent"
                  />
                  <span
                    className={`truncate ${
                      item.checked ? "text-text/40 line-through" : "text-text"
                    }`}
                  >
                    {item.name}
                    {item.amount ? ` - ${item.amount}` : ""}
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded-md px-2.5 py-1 text-sm font-medium text-text/60 transition-colors hover:bg-accent/15 hover:text-accent"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-primary/10 pt-4">
            <button
              onClick={clearChecked}
              className="rounded-lg border border-accent/35 bg-background px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-accent/10"
            >
              Remove Checked
            </button>
            <button
              onClick={clearAll}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-primary/90"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;
