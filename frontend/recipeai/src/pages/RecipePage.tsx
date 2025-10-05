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
      <div className="max-w-4xl mx-auto p-6 bg-background min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-secondary rounded-full"></div>
            <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-text text-xl font-semibold">Loading recipe...</p>
          <p className="text-text/60 text-sm mt-2">
            Preparing your delicious recipe
          </p>
        </div>
      </div>
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
        {!recipeId && user && (
          <div>
            <button
              className="bg-accent text-text px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              onClick={() => saveRecipe()}
            >
              Save Recipe
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
