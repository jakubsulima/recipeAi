import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../lib/hooks";
import { useUser } from "./context";

export interface FridgeIngredient {
  id: number;
  name: string;
  expirationDate: string | null; // ISO date string or null if no expiration date
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
  const { user, loading: userLoading } = useUser();

  const refreshFridgeItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient("getFridgeIngredients", false);
      console.log("Fetched fridge items:", response);
      setFridgeItems(response);
    } catch (err: any) {
      setError("Failed to fetch fridge items");
      console.error("Failed to fetch fridge items:", err);
    } finally {
      setLoading(false);
    }
  };

  const addFridgeItem = async (item: Omit<FridgeIngredient, "id">) => {
    try {
      const response = await apiClient("addFridgeIngredient", true, {
        name: item.name,
        expirationDate: item.expirationDate,
      });

      const newItem: FridgeIngredient = {
        id: response.id || Date.now(),
        name: item.name,
        expirationDate: item.expirationDate,
      };
      setFridgeItems((prev) => [...prev, newItem]);
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

  useEffect(() => {
    if (userLoading) return;
    if (!user || !user.id) {
      setFridgeItems([]);
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
    removeFridgeItem,
    refreshFridgeItems,
    getFridgeItemNames,
  };

  return (
    <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>
  );
};
