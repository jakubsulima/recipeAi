import { createContext, useContext, useState, useEffect } from "react";
import { apiClient, deleteClient } from "../lib/hooks";
import { useUser } from "./context";

export interface FridgeIngredient {
  id: number;
  name: string;
  expirationDate: string | null;
  amount?: string | number;
  unit: unitType;
}

export interface AddFridgeIngredientInput {
  name: string;
  expirationDate: string | null;
  amount?: string | number;
  unit: unitType;
}

interface FridgeContextType {
  fridgeItems: FridgeIngredient[];
  setFridgeItems: React.Dispatch<React.SetStateAction<FridgeIngredient[]>>;
  loading: boolean;
  error: string;
  addFridgeItem: (item: AddFridgeIngredientInput) => Promise<void>;
  addFridgeItemsBatch: (items: AddFridgeIngredientInput[]) => Promise<void>;
  removeFridgeItem: (id: number) => Promise<void>;
  updateFridgeItem: (id: number, newAmount: string) => Promise<void>;
  refreshFridgeItems: () => Promise<void>;
  getFridgeItemNames: () => string[];
}

export const UNITS = {
  g: "GRAMS",
  kg: "KILOGRAMS",
  ml: "MILLILITERS",
  l: "LITERS",
  pcs: "PIECES",
  "": "",
} as const;

export type unitType = keyof typeof UNITS;

export const UNIT_OPTIONS: unitType[] = Object.keys(UNITS) as unitType[];
export const UNIT_VALUES = Object.values(UNITS);

const FridgeContext = createContext<FridgeContextType>(null!);

export const useFridge = () => {
  const context = useContext(FridgeContext);
  if (!context) {
    throw new Error("useFridge must be used within a FridgeProvider");
  }
  return context;
};

export const FridgeProvider = ({ children }: { children: React.ReactNode }) => {
  const [fridgeItems, setFridgeItems] = useState<FridgeIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [expirationNotificationShown, setExpirationNotificationShown] =
    useState(() => localStorage.getItem("expirationNotificationShown") === "true");
  const { user, loading: userLoading } = useUser();

  const handleSetExpirationNotificationShown = (value: boolean) => {
    setExpirationNotificationShown(value);
    localStorage.setItem("expirationNotificationShown", value ? "true" : "false");
  };

  const refreshFridgeItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient("getFridgeIngredients", false);
      setFridgeItems(response);

      if (!expirationNotificationShown) {
        const today = new Date();
        const expiredItems = response.filter((item: FridgeIngredient) => {
          if (!item.expirationDate) {
            return false;
          }
          const [day, month, year] = item.expirationDate.split("-");
          const expDate = new Date(`${year}-${month}-${day}`);
          expDate.setHours(0, 0, 0, 0);
          return expDate < today;
        });

        if (expiredItems.length > 0) {
          alert(
            `Warning: You have expired products: ${expiredItems
              .map((item: FridgeIngredient) => item.name)
              .join(", ")}`
          );
          handleSetExpirationNotificationShown(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch fridge items");
    } finally {
      setLoading(false);
    }
  };

  const addFridgeItem = async (item: AddFridgeIngredientInput) => {
    try {
      await apiClient("addFridgeIngredient", true, {
        name: item.name,
        expirationDate: item.expirationDate,
        amount: item.amount,
        unit: UNITS[item.unit],
      });

      await refreshFridgeItems();
    } catch (err: any) {
      throw new Error("Failed to add fridge item");
    }
  };

  const addFridgeItemsBatch = async (items: AddFridgeIngredientInput[]) => {
    try {
      await Promise.all(
        items.map((item) =>
          apiClient("addFridgeIngredient", true, {
            name: item.name,
            expirationDate: item.expirationDate,
            amount: item.amount,
            unit: UNITS[item.unit],
          })
        )
      );

      await refreshFridgeItems();
    } catch (err: any) {
      throw new Error("Failed to add scanned items");
    }
  };

  const removeFridgeItem = async (id: number) => {
    try {
      await deleteClient(`deleteFridgeIngredient/${id}`);
      setFridgeItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      throw new Error("Failed to remove fridge item");
    }
  };

  const updateFridgeItem = async (id: number, newAmount: string) => {
    try {
      await apiClient(`updateFridgeIngredient/${id}`, true, {
        amount: newAmount,
      });
      setFridgeItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, amount: newAmount } : item
        )
      );
    } catch (err: any) {
      throw new Error("Failed to update fridge item");
    }
  };

  const getFridgeItemNames = () => {
    return fridgeItems.map((item) => item.name);
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }

    if (!user || !user.id) {
      setFridgeItems([]);
      localStorage.removeItem("expirationNotificationShown");
      setExpirationNotificationShown(false);
      return;
    }

    refreshFridgeItems();
  }, [user, userLoading]);

  const value: FridgeContextType = {
    fridgeItems,
    setFridgeItems,
    loading,
    error,
    addFridgeItem,
    addFridgeItemsBatch,
    removeFridgeItem,
    updateFridgeItem,
    refreshFridgeItems,
    getFridgeItemNames,
  };

  return (
    <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
  );
};
