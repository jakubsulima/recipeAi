export interface ShoppingListItem {
  id: string;
  name: string;
  amount?: string | number | null;
  unit?: string | null;
  checked: boolean;
  createdAt: string;
}

interface ShoppingItemInput {
  name: string;
  amount?: string | number | null;
  unit?: string | null;
}

const STORAGE_KEY = "recipeai.shoppingList";

const normalizeName = (value: string) => value.trim().toLowerCase();

export const readShoppingList = (): ShoppingListItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeShoppingList = (items: ShoppingListItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const addShoppingItems = (
  newItems: ShoppingItemInput[]
): ShoppingListItem[] => {
  const existing = readShoppingList();
  const existingNames = new Set(existing.map((item) => normalizeName(item.name)));

  const additions: ShoppingListItem[] = newItems
    .filter((item) => item.name && item.name.trim() !== "")
    .filter((item) => !existingNames.has(normalizeName(item.name)))
    .map((item) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: item.name.trim(),
      amount: item.amount ?? null,
      unit: item.unit ?? null,
      checked: false,
      createdAt: new Date().toISOString(),
    }));

  const updated = [...existing, ...additions];
  writeShoppingList(updated);
  return updated;
};
