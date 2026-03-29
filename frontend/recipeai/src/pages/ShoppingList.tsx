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

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl bg-background p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-text">Shopping List</h1>
        <span className="rounded-full border border-primary/20 bg-secondary px-3 py-1 text-sm text-text/80">
          {remainingCount} left
        </span>
      </div>

      <div className="mb-5 rounded-lg border border-primary/10 bg-secondary p-4">
        <label className="mb-2 block text-sm font-medium text-text">
          Add item manually
        </label>
        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addManualItem();
              }
            }}
            placeholder="e.g. Tomatoes"
            className="w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-text"
          />
          <button
            onClick={addManualItem}
            className="rounded-md bg-primary px-4 py-2 font-semibold text-background hover:bg-primary/90"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-primary/10 bg-secondary p-4">
        {items.length === 0 ? (
          <p className="text-text/70">Your shopping list is empty.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-primary/10 bg-background px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
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
                  className="rounded px-2 py-1 text-sm text-error hover:bg-error/10"
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
              className="rounded-md border border-primary/20 px-3 py-2 text-sm font-medium text-text hover:bg-background"
            >
              Remove Checked
            </button>
            <button
              onClick={clearAll}
              className="rounded-md border border-error/40 px-3 py-2 text-sm font-medium text-error hover:bg-error/10"
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
