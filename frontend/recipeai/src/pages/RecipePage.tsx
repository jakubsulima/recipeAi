import { useLocation, useParams, useNavigate } from "react-router-dom";
import { apiClient, generateRecipe, deleteClient, cleanAiJsonString } from "../lib/hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFridge } from "../context/fridgeContext";
import { useUser } from "../context/context";
import FoodLoadingScreen from "../components/FoodLoadingScreen";
import { addShoppingItems } from "../lib/shoppingList";
import ErrorAlert from "../components/ErrorAlert";

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
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-primary/15 bg-secondary px-6 py-8 text-center shadow-sm">
          <div className="text-xl font-semibold text-text">No recipe data available</div>
          <p className="mt-1 text-sm text-text/60">
            Try generating a new recipe from the homepage.
          </p>
        </div>
      </div>
    );
  }

  const ingredientCount = recipeData.ingredients?.length ?? 0;
  const instructionCount = recipeData.instructions?.length ?? 0;

  return (
    <div className="mobile-page-enter min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <ErrorAlert message={error} className="mb-5" onAutoHide={() => setError("")} />

      <section className="mobile-card-enter relative overflow-hidden rounded-3xl border border-accent/35 bg-secondary p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative">
          <p className="mb-2 inline-flex rounded-full border border-primary/15 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text/60">
            AI Kitchen Recipe
          </p>
          <h1 className="text-3xl font-bold leading-tight text-text sm:text-4xl">
            {recipeData.name}
          </h1>

          {recipeData.description && (
            <p className="mt-3 max-w-3xl text-base text-text/75 sm:text-lg">
              {recipeData.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {recipeData.timeToPrepare && (
              <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-text">
                {recipeData.timeToPrepare}
              </span>
            )}
            <span className="rounded-full border border-primary/15 bg-background px-3 py-1.5 text-sm text-text/75">
              {ingredientCount} ingredients
            </span>
            <span className="rounded-full border border-primary/15 bg-background px-3 py-1.5 text-sm text-text/75">
              {instructionCount} steps
            </span>
          </div>
        </div>
      </section>

      {recipeData.nutrition && (
        <div className="mobile-card-enter mobile-card-delay-1 mt-6 rounded-2xl border border-accent/30 bg-secondary p-5">
          <h3 className="mb-4 text-lg font-semibold text-text">Nutrition (estimated)</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-accent/20 bg-background px-3 py-2.5 text-sm text-text">
              <span className="block text-text/60">Calories</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.calories, " kcal")}
              </span>
            </div>
            <div className="rounded-xl border border-accent/20 bg-background px-3 py-2.5 text-sm text-text">
              <span className="block text-text/60">Protein</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.protein, " g")}
              </span>
            </div>
            <div className="rounded-xl border border-accent/20 bg-background px-3 py-2.5 text-sm text-text">
              <span className="block text-text/60">Carbs</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.carbs, " g")}
              </span>
            </div>
            <div className="rounded-xl border border-accent/20 bg-background px-3 py-2.5 text-sm text-text">
              <span className="block text-text/60">Fats</span>
              <span className="font-semibold">
                {formatMacro(recipeData.nutrition.fats, " g")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mobile-card-enter mobile-card-delay-1 h-full rounded-2xl border border-primary/10 bg-secondary p-6">
            <h2 className="mb-4 text-2xl font-semibold text-text">
              Ingredients
            </h2>
            <ul className="space-y-2.5">
              {(recipeData.ingredients || []).map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-primary/10 bg-background px-3 py-2 text-text"
                >
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-sm text-text/75">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="mobile-card-enter mobile-card-delay-2 h-full rounded-2xl border border-primary/10 bg-secondary p-6">
            <h2 className="mb-4 text-2xl font-semibold text-text">
              Instructions
            </h2>
            <ol className="space-y-3">
              {(recipeData.instructions || []).map((instruction, index) => (
                <li key={index} className="flex gap-3 rounded-lg border border-primary/10 bg-background px-3 py-3 text-text">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-text/85">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="mobile-card-enter mobile-card-delay-2 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-secondary p-4">
        <div className="flex flex-wrap gap-3">
          <button
            className="mobile-soft-press rounded-lg bg-primary px-4 py-2.5 font-semibold text-background transition-colors hover:bg-primary/90"
            onClick={handleGenerateShoppingList}
          >
            Generate Shopping List
          </button>

          {!recipeId && (
            <button
              className="mobile-soft-press rounded-lg border border-primary/20 bg-background px-4 py-2.5 font-semibold text-text transition-colors hover:bg-background/80"
              onClick={() => loadNewRecipeCallback(search)}
            >
              I want new recipe
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {!recipeId && user && (
            <button
              className={`rounded-lg px-4 py-2.5 font-semibold transition-colors ${
                saveStatus === "saved"
                  ? "cursor-default bg-green-600 text-white"
                  : saveStatus === "saving"
                  ? "cursor-wait bg-accent/60 text-text"
                  : "mobile-soft-press bg-accent text-text hover:bg-accent/90"
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
          )}

          {recipeId && user && (
            <button
              className="mobile-soft-press rounded-lg bg-accent px-4 py-2.5 font-semibold text-text transition-colors hover:bg-accent/90"
              onClick={handleDelete}
            >
              Delete Recipe
            </button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default RecipePage;
