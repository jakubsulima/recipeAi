import axios from "axios";
import { API_URL } from "./constants";

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
const SHOPPING_LIST_ENDPOINT = `${API_URL}shoppingList`;

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeRemoteItem = (item: any): ShoppingListItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const name = typeof item.name === "string" ? item.name.trim() : "";
  if (!name) {
    return null;
  }

  return {
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    amount: toNumberOrNull(item.amount),
    unit: typeof item.unit === "string" && item.unit.trim() ? item.unit.trim() : null,
    checked: Boolean(item.checked),
    createdAt:
      typeof item.createdAt === "string" && item.createdAt.trim()
        ? item.createdAt
        : new Date().toISOString(),
  };
};

const toSyncPayloadItem = (item: ShoppingListItem) => ({
  id: item.id,
  name: item.name,
  amount: toNumberOrNull(item.amount),
  unit: item.unit ?? null,
  checked: item.checked,
  createdAt: item.createdAt,
});

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

export const fetchShoppingList = async (): Promise<ShoppingListItem[]> => {
  const response = await axios.get(SHOPPING_LIST_ENDPOINT, {
    withCredentials: true,
  });

  const remoteItems = Array.isArray(response.data) ? response.data : [];
  return remoteItems.map(normalizeRemoteItem).filter((item): item is ShoppingListItem => item !== null);
};

export const syncShoppingList = async (
  items: ShoppingListItem[]
): Promise<ShoppingListItem[]> => {
  const response = await axios.put(
    SHOPPING_LIST_ENDPOINT,
    {
      items: items.map(toSyncPayloadItem),
    },
    {
      withCredentials: true,
    }
  );

  const syncedItems = Array.isArray(response.data) ? response.data : [];
  return syncedItems.map(normalizeRemoteItem).filter((item): item is ShoppingListItem => item !== null);
};
