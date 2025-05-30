import { createContext, useContext, useState, useEffect } from "react";
import { AJAX } from "../lib/hooks";
import { useUser } from "./context";

export interface FridgeIngredient {
  id: number;
  name: string;
  expirationDate: string;
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
      const response = await AJAX("getFridgeIngredients", false);
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
      const response = await AJAX("addFridgeIngredient", true, {
        name: item.name,
        expirationDate: item.expirationDate,
      });

      const newItem: FridgeIngredient = {
        id: response.id || Date.now(),
        name: item.name,
        expirationDate: item.expirationDate,
      };
      setFridgeItems((prev) => [...prev, newItem]);
    } catch (err: any) {
      throw new Error("Failed to add fridge item");
    }
  };

  const removeFridgeItem = async (id: number) => {
    try {
      await AJAX(`deleteFridgeIngredient/${id}`, true, {});
      // Optimistically update the local state
      setFridgeItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      throw new Error("Failed to remove fridge item");
    }
  };

  const getFridgeItemNames = () => {
    return fridgeItems.map((item) => item.name);
  };

  // Fetch fridge items when component mounts
  useEffect(() => {
    if (userLoading) return; // Wait for user data to load
    if (!user || !user.id) {
      setFridgeItems([]); // No user, clear fridge items
      return;
    }
    refreshFridgeItems();
  }, []);

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
