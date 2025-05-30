import { useLocation, useParams } from "react-router";
import { AJAX, generateRecipe } from "../lib/hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFridge } from "../context/fridgeContext";

export interface RecipeIngredient {
  name: string;
  amount: string | number | null;
  unit: string;
}

export interface RecipeData {
  id?: string;
  description?: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  timeToPrepare?: string;
}

const RecipePage = () => {
  const location = useLocation();
  const params = useParams();
  const recipeId = params.id;
  const { getFridgeItemNames, loading: fridgeLoading } = useFridge();

  const { search, existingRecipe } = location.state || {};
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [error, setError] = useState<string>("");

  const currentRecipeIdentifierRef = useRef<string | null>(null);

  const fetchRecipeCallback = useCallback(async () => {
    if (!recipeId) return;
    try {
      setIsLoading(true);
      setError("");
      const response = await AJAX(`getRecipe/${recipeId}`, false);
      setRecipeData(response);
      currentRecipeIdentifierRef.current = recipeId;
    } catch (err: any) {
      console.error("Error fetching recipe:", err);
      setError("Failed to load recipe. Please try again.");
      currentRecipeIdentifierRef.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  const loadNewRecipeCallback = useCallback(
    async (currentSearchTerm: string) => {
      if (!currentSearchTerm) return;
      try {
        setIsLoading(true);
        setError("");
        const fridgeIngredients = getFridgeItemNames();
        console.log(
          "Fridge ingredients for search:",
          currentSearchTerm,
          fridgeIngredients
        );
        const response = await generateRecipe(
          currentSearchTerm,
          fridgeIngredients
        );

        let jsonString =
          typeof response === "string"
            ? response.replace(/```json|```/g, "").trim()
            : JSON.stringify(response); // If it's already an object, stringify for uniform processing

        // Attempt to fix common JSON issues
        // 1. Remove trailing commas in objects and arrays
        // This regex looks for a comma followed by a closing brace or bracket,
        // possibly with whitespace in between, and removes the comma.
        jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

        // 2. Normalize the timeToPrepare key
        jsonString = jsonString.replace(
          /"timeToPrepare\(string\)"/g,
          '"timeToPrepare"'
        );

        console.log("Cleaned response before parsing:", jsonString);
        console.log("Response for search:", currentSearchTerm, jsonString);
        const parsedData = JSON.parse(jsonString);

        setRecipeData(parsedData);
        currentRecipeIdentifierRef.current = currentSearchTerm;
      } catch (err: any) {
        console.error("Error generating recipe:", err);
        setError("Failed to load recipe. Please try again.");
        currentRecipeIdentifierRef.current = null;
      } finally {
        setIsLoading(false);
      }
    },
    [getFridgeItemNames]
  );

  useEffect(() => {
    if (existingRecipe) {
      setRecipeData(existingRecipe);
      setIsLoading(false);
      setError("");

      return;
    }

    if (recipeId) {
      if (
        currentRecipeIdentifierRef.current === recipeId &&
        recipeData != null
      ) {
        setIsLoading(false);
        setError("");
      } else {
        fetchRecipeCallback();
      }
      return;
    }

    if (search) {
      if (!fridgeLoading) {
        if (
          currentRecipeIdentifierRef.current === search &&
          recipeData != null
        ) {
          setIsLoading(false);
          setError("");
        } else {
          loadNewRecipeCallback(search);
        }
      } else {
        if (
          currentRecipeIdentifierRef.current !== search ||
          recipeData == null
        ) {
          setIsLoading(true);
          setError("");
        }
      }
      return;
    }

    if (!fridgeLoading) {
      setError("No search term or recipe ID provided");
      setIsLoading(false);
      setRecipeData(null);
      currentRecipeIdentifierRef.current = null;
    } else {
      setIsLoading(true);
      setError("");
    }
  }, [
    search,
    recipeId,
    existingRecipe,
    fridgeLoading,
    loadNewRecipeCallback,
    fetchRecipeCallback,
    recipeData,
  ]);

  const saveRecipe = async () => {
    try {
      setIsLoading(true);
      console.log(recipeData);
      await AJAX("addRecipe", true, {
        name: recipeData?.name,
        ingredients: recipeData?.ingredients,
        instructions: recipeData?.instructions,
      });
    } catch (error: any) {
      console.log(error);
      if (error.status === 401) {
        setError("You must be logged in to save a recipe.");
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading recipe...</div>
      </div>
    );
  }

  if (!recipeData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">No recipe data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="flex justify-center">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2">{recipeData.name}</h1>
      {recipeData.timeToPrepare && (
        <h2 className="text-2xl font-bold mb-2">{recipeData.timeToPrepare}</h2>
      )}
      {recipeData.description && (
        <p className="text-gray-600 mb-6">{recipeData.description}</p>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {(recipeData.ingredients || []).map((ingredient, index) => (
              <li key={index} className="flex justify-between">
                <span>{ingredient.name}</span>
                <span>
                  {ingredient.amount} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-3">
            {(recipeData.instructions || []).map((instruction, index) => (
              <li key={index} className="flex">
                <span className="text-blue-500 font-bold mr-3">
                  {index + 1}.
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {!recipeId && (
        <div className="mb-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => saveRecipe()}
          >
            Save Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipePage;
