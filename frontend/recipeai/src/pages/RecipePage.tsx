import { useLocation, useParams, useNavigate } from "react-router-dom";
import { apiClient, generateRecipe } from "../lib/hooks";
import { useState, useEffect, useCallback, useRef } from "react";
import { useFridge } from "../context/fridgeContext";
import { useUser } from "../context/context";

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
}

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

  const currentRecipeIdentifierRef = useRef<string | null>(null);

  const loadNewRecipeCallback = useCallback(
    async (currentSearchTerm: string) => {
      if (!currentSearchTerm) return;
      try {
        setIsLoading(true);
        setError("");
        const fridgeIngredients = getFridgeItemNames();
        const response = await generateRecipe(
          currentSearchTerm,
          fridgeIngredients
        );

        let jsonString =
          typeof response === "string"
            ? response.replace(/```json|```/g, "").trim()
            : JSON.stringify(response);
        jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

        jsonString = jsonString.replace(
          /"timeToPrepare\(string\)"/g,
          '"timeToPrepare"'
        );
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
              console.log("Generating new recipe for search:", search);
              setIsLoading(true);
              setError("");
              const fridgeIngredients = getFridgeItemNames();
              const response = await generateRecipe(search, fridgeIngredients);

              let jsonString =
                typeof response === "string"
                  ? response.replace(/```json|```/g, "").trim()
                  : JSON.stringify(response);
              jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");
              jsonString = jsonString.replace(
                /"timeToPrepare\(string\)"/g,
                '"timeToPrepare"'
              );

              const parsedData = JSON.parse(jsonString);
              setRecipeData(parsedData);
              currentRecipeIdentifierRef.current = search;
            } catch (err: any) {
              console.error("Error generating recipe:", err);
              setError("Failed to load recipe. Please try again.");
              currentRecipeIdentifierRef.current = null;
            } finally {
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
    try {
      setIsLoading(true);
      await apiClient("addRecipe", true, {
        name: recipeData?.name,
        description: recipeData?.description,
        timeToPrepare: recipeData?.timeToPrepare,
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

  const handleDelete = async () => {
    if (!recipeId) return;

    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        setIsLoading(true);
        await apiClient(`deleteRecipe/${recipeId}`, true, { method: "DELETE" });
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
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-75 z-50">
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
                <span className="text-main font-bold mr-3">{index + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="display flex justify-between flex-row items-center mt-8">
        {!recipeId && user && (
          <div className="mb-8">
            <button
              className="bg-primary text-black px-4 py-2 rounded-md"
              onClick={() => saveRecipe()}
            >
              Save Recipe
            </button>
          </div>
        )}

        {recipeId && user && (
          <div className="mb-8">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              onClick={handleDelete}
            >
              Delete Recipe
            </button>
          </div>
        )}

        {!recipeId && (
          <div className="mb-8">
            <button
              className="bg-primary rounded-md text-black px-4 py-2"
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
