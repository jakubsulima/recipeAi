import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../lib/hooks";
import { useUser } from "./context";
import { U } from "vitest/dist/chunks/environment.d.Dmw5ulng.js";

export interface FridgeIngredient {
  id: number;
  name: string;
  expirationDate: string | null;
  amount?: string;
  unit: unitType;
}

interface FridgeContextType {
  fridgeItems: FridgeIngredient[];
  setFridgeItems: React.Dispatch<React.SetStateAction<FridgeIngredient[]>>;
  loading: boolean;
  error: string;
  addFridgeItem: (item: Omit<FridgeIngredient, "id">) => Promise<void>;
  removeFridgeItem: (id: number) => Promise<void>;
  refreshFridgeItems: () => Promise<void>;
  getFridgeItemNames: () => string[];
}

export type unitType = "g" | "kg" | "ml" | "l" | "pcs" | "";
enum Unit {
  g = "GRAMS",
  kg = "KILOGRAMS",
  ml = "MILLILITERS",
  l = "LITERS",
  pcs = "PIECES",
  "" = "",
}
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
  const [expiredAlertShown, setExpiredAlertShown] = useState(false);
  const { user, loading: userLoading } = useUser();
  const [expirationNotificationShown, setExpirationNotificationShown] =
    useState(
      () => localStorage.getItem("expirationNotificationShown") === "true"
    );

  const refreshFridgeItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient("getFridgeIngredients", false);
      setFridgeItems(response);
      console.log(expirationNotificationShown);
      if (expirationNotificationShown === false) {
        const today = new Date();
        const expiredItems = response.filter((item: FridgeIngredient) => {
          if (item.expirationDate) {
            const [day, month, year] = item.expirationDate.split("-");
            const expDate = new Date(`${year}-${month}-${day}`);
            expDate.setHours(0, 0, 0, 0);
            return expDate < today;
          }
          return false;
        });
        if (expiredItems.length > 0 && !expiredAlertShown) {
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
      console.error("Failed to fetch fridge items:", err);
    } finally {
      setLoading(false);
    }
  };

  const addFridgeItem = async (item: Omit<FridgeIngredient, "id">) => {
    try {
      console.log("Adding fridge item:", Unit[item.unit]);
      await apiClient("addFridgeIngredient", true, {
        name: item.name,
        expirationDate: item.expirationDate,
        amount: item.amount,
        unit: Unit[item.unit],
      });

      refreshFridgeItems();
    } catch (err: any) {
      throw new Error("Failed to add fridge item");
    }
  };

  const removeFridgeItem = async (id: number) => {
    try {
      await apiClient(`deleteFridgeIngredient/${id}`, true, {});
      setFridgeItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      throw new Error("Failed to remove fridge item");
    }
  };

  const getFridgeItemNames = () => {
    return fridgeItems.map((item) => item.name);
  };

  const handleSetExpirationNotificationShown = (value: boolean) => {
    setExpirationNotificationShown(value);
    localStorage.setItem(
      "expirationNotificationShown",
      value ? "true" : "false"
    );
  };

  useEffect(() => {
    if (userLoading) return;
    if (!user || !user.id) {
      setFridgeItems([]);
      setExpiredAlertShown(false);
      localStorage.removeItem("expirationNotificationShown");
      return;
    }
    refreshFridgeItems(); // Show alert after login
  }, [user, userLoading]);

  const value: FridgeContextType = {
    fridgeItems,
    setFridgeItems,
    loading,
    error,
    addFridgeItem,
    removeFridgeItem,
    refreshFridgeItems,
    getFridgeItemNames,
  };

  return (
    <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
  );
};
