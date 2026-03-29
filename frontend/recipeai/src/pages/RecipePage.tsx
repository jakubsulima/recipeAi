import { useLocation, useParams, useNavigate } from "react-router-dom";
import { apiClient, generateRecipe, deleteClient, cleanAiJsonString } from "../lib/hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFridge } from "../context/fridgeContext";
import { useUser } from "../context/context";
import FoodLoadingScreen from "../components/FoodLoadingScreen";
import { addShoppingItems } from "../lib/shoppingList";

export interface RecipeIngredient {
  name: string;
  amount: string | number | null;
  unit: string;
}

export interface RecipeData {
  title: string;
  id?: string;
  description?: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  timeToPrepare: string;
  nutrition?: {
    calories?: string | number;
    protein?: string | number;
    carbs?: string | number;
    fats?: string | number;
  };
}

const formatMacro = (value: string | number | undefined, suffix: string) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return `${value}${suffix}`;
  }

  const trimmed = value.trim();
  return trimmed ? `${trimmed}${suffix}` : "-";
};

const RecipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const recipeId = params.id;
  const { getFridgeItemNames, loading: fridgeLoading } = useFridge();
  const { user } = useUser();

  const { search, existingRecipe } = location.state || {};
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [error, setError] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const currentRecipeIdentifierRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadNewRecipeCallback = useCallback(
    async (currentSearchTerm: string) => {
      if (!currentSearchTerm) return;
      try {
        setIsLoading(true);
        setError("");
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const fridgeIngredients = getFridgeItemNames();
        const response = await generateRecipe(
          currentSearchTerm,
          fridgeIngredients,
          controller.signal
        );

        const jsonString = cleanAiJsonString(response);
        const parsedData = JSON.parse(jsonString);

        setRecipeData(parsedData);
        currentRecipeIdentifierRef.current = currentSearchTerm;
        setIsLoading(false);
      } catch (err: any) {
        if (err.name === "AbortError") return; // new request owns loading state
        console.error("Error generating recipe:", err);
        setError("Failed to load recipe. Please try again.");
        currentRecipeIdentifierRef.current = null;
        setIsLoading(false);
      }
    },
    [getFridgeItemNames]
  );

  useEffect(() => {
    const loadRecipe = async () => {
      if (existingRecipe) {
        setRecipeData(existingRecipe);
        setIsLoading(false);
        setError("");
        return;
      }

      if (recipeId) {
        if (currentRecipeIdentifierRef.current !== recipeId) {
          try {
            setIsLoading(true);
            setError("");
            const response = await apiClient(`getRecipe/${recipeId}`, false);
            setRecipeData(response);
            currentRecipeIdentifierRef.current = recipeId;
          } catch (err: any) {
            console.error("Error fetching recipe:", err);
            setError("Failed to load recipe. Please try again.");
            currentRecipeIdentifierRef.current = null;
          } finally {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
        return;
      }

      if (search) {
        if (!fridgeLoading) {
          if (currentRecipeIdentifierRef.current !== search) {
            try {
              setIsLoading(true);
              setError("");
              const fridgeIngredients = getFridgeItemNames();
              abortControllerRef.current?.abort();
              const controller = new AbortController();
              abortControllerRef.current = controller;
              const response = await generateRecipe(search, fridgeIngredients, controller.signal);

              const jsonString = cleanAiJsonString(response);
              const parsedData = JSON.parse(jsonString);
              setRecipeData(parsedData);
              currentRecipeIdentifierRef.current = search;
              setIsLoading(false);
            } catch (err: any) {
              if (err.name === "AbortError") return; // new request owns loading state
              console.error("Error generating recipe:", err);
              setError("Failed to load recipe. Please try again.");
              currentRecipeIdentifierRef.current = null;
              setIsLoading(false);
            }
          } else {
            setIsLoading(false);
          }
        }
        return;
      }

      if (!fridgeLoading) {
        setError("No search term or recipe ID provided");
        setIsLoading(false);
        setRecipeData(null);
        currentRecipeIdentifierRef.current = null;
      }
    };

    loadRecipe();
  }, [search, fridgeLoading, existingRecipe, recipeId]);

  const saveRecipe = async () => {
    if (!recipeData?.name || !recipeData?.ingredients?.length || !recipeData?.instructions?.length) {
      setError("Recipe data is incomplete and cannot be saved.");
      return;
    }
    try {
      setSaveStatus("saving");
      setError("");
      await apiClient("addRecipe", true, {
        name: recipeData.name,
        description: recipeData.description,
        timeToPrepare: recipeData.timeToPrepare,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
      });
      setSaveStatus("saved");
    } catch (error: any) {
      setSaveStatus("error");
      if (error.status === 401) {
        setError("You must be logged in to save a recipe.");
      } else if (error.status === 409) {
        setError("This recipe is already saved in your collection.");
      } else {
        setError(error.message || "Failed to save recipe. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShoppingList = () => {
    if (!recipeData?.ingredients?.length) {
      setError("No ingredients available to generate shopping list.");
      return;
    }

    const fridgeNameSet = new Set(
      getFridgeItemNames().map((item) => item.trim().toLowerCase())
    );

    const missingIngredients = recipeData.ingredients.filter(
      (ingredient) => !fridgeNameSet.has(ingredient.name.trim().toLowerCase())
    );

    if (missingIngredients.length === 0) {
      setError("Great! You already have all ingredients for this recipe.");
      return;
    }

    addShoppingItems(
      missingIngredients.map((ingredient) => ({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
      }))
    );

    navigate("/ShoppingList");
  };

  const handleDelete = async () => {
    if (!recipeId) return;

    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        setIsLoading(true);
        await deleteClient(`deleteRecipe/${recipeId}`);
        navigate("/myRecipes");
      } catch (err: any) {
        console.error("Error deleting recipe:", err);
        setError(err.message || "Failed to delete recipe.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    const isGeneratingRecipe = Boolean(search) && !recipeId && !existingRecipe;

    return (
      <FoodLoadingScreen
        title={isGeneratingRecipe ? "Generating your recipe..." : "Loading recipe..."}
        subtitle={
          isGeneratingRecipe
            ? "Mixing ingredients, matching flavors, and adding a spicy twist"
            : "Preparing your delicious recipe"
        }
        variant={isGeneratingRecipe ? "generating" : "default"}
      />
    );
  }

  if (!recipeData) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-xl text-text">No recipe data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background min-h-screen">
      {error && (
        <div className="flex justify-center mb-4">
          <div className="text-xl text-accent">{error}</div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2 text-text">{recipeData.name}</h1>
      {recipeData.timeToPrepare && (
        <h2 className="text-2xl font-bold mb-2 text-accent">
          {recipeData.timeToPrepare}
        </h2>
      )}
      {recipeData.description && (
        <p className="text-text/80 mb-6">{recipeData.description}</p>
      )}

      {recipeData.nutrition && (
        <div className="mb-6 rounded-lg border border-primary/10 bg-secondary p-4">
          <h3 className="mb-3 text-lg font-semibold text-text">Nutrition (estimated)</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md bg-background px-3 py-2 text-sm text-text">
              <span className="block text-text/60">Calories</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.calories, " kcal")}
              </span>
            </div>
            <div className="rounded-md bg-background px-3 py-2 text-sm text-text">
              <span className="block text-text/60">Protein</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.protein, " g")}
              </span>
            </div>
            <div className="rounded-md bg-background px-3 py-2 text-sm text-text">
              <span className="block text-text/60">Carbs</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.carbs, " g")}
              </span>
            </div>
            <div className="rounded-md bg-background px-3 py-2 text-sm text-text">
              <span className="block text-text/60">Fats</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.fats, " g")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-secondary p-6 rounded-lg inline-block min-w-full">
            <h2 className="text-2xl font-semibold mb-4 text-text">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {(recipeData.ingredients || []).map((ingredient, index) => (
                <li key={index} className="flex justify-between text-text">
                  <span>{ingredient.name}</span>
                  <span className="text-text">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-secondary p-6 rounded-lg inline-block min-w-full">
            <h2 className="text-2xl font-semibold mb-4 text-text">
              Instructions
            </h2>
            <ol className="space-y-3">
              {(recipeData.instructions || []).map((instruction, index) => (
                <li key={index} className="flex text-text">
                  <span className="text-accent font-bold mr-3">
                    {index + 1}.
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="display flex justify-between flex-row items-center mt-8 flex-wrap gap-4">
        <div>
          <button
            className="bg-primary text-background rounded-lg px-4 py-2 font-semibold hover:bg-primary/90 transition-colors"
            onClick={handleGenerateShoppingList}
          >
            Generate Shopping List
          </button>
        </div>

        {!recipeId && user && (
          <div className="flex flex-col items-start gap-1">
            <button
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                saveStatus === "saved"
                  ? "bg-green-600 text-white cursor-default"
                  : saveStatus === "saving"
                  ? "bg-accent/60 text-text cursor-wait"
                  : "bg-accent text-text hover:bg-accent/90"
              }`}
              onClick={() => saveRecipe()}
              disabled={saveStatus === "saving" || saveStatus === "saved"}
            >
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                ? "Saved ✓"
                : "Save Recipe"}
            </button>
          </div>
        )}

        {recipeId && user && (
          <div>
            <button
              className="bg-accent text-text px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              onClick={handleDelete}
            >
              Delete Recipe
            </button>
          </div>
        )}

        {!recipeId && (
          <div>
            <button
              className="bg-primary text-background rounded-lg px-4 py-2 font-semibold hover:bg-primary/90 transition-colors"
              onClick={() => loadNewRecipeCallback(search)}
            >
              I want new recipe
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipePage;
