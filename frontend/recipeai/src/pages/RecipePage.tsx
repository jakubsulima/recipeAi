import { useLocation, useParams } from "react-router";
import { AJAX, generateRecipe } from "../lib/hooks";
import { useState, useEffect } from "react";
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
  const recipeId = params.id; // Get ID from URL if present
  const { getFridgeItemNames } = useFridge();

  const { search, existingRecipe } = location.state || {};
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [error, setError] = useState<string>("");

  const loadRecipe = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const fridgeIngredients = getFridgeItemNames();
      const response = await generateRecipe(searchTerm, fridgeIngredients);

      const cleanedResponse =
        typeof response === "string"
          ? response.replace(/```json|```/g, "").trim()
          : response;

      console.log("Response:", cleanedResponse);
      const parsedData =
        typeof cleanedResponse === "string"
          ? JSON.parse(cleanedResponse)
          : cleanedResponse;

      setRecipeData(parsedData);
    } catch (error: any) {
      console.error("Error generating recipe:", error);
      setError("Failed to load recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const response = await AJAX(`getRecipe/${recipeId}`, false);
        setRecipeData(response);
      } catch (error: any) {
        console.error("Error fetching recipe:", error);
        setError("Failed to load recipe. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (existingRecipe) {
      setRecipeData(existingRecipe);
      setIsLoading(false);
      return;
    }

    if (recipeId) {
      fetchRecipe();
      return;
    }

    if (search && !recipeId) {
      loadRecipe(search);
    } else if (!recipeId) {
      setError("No search term or recipe ID provided");
      setIsLoading(false);
    }
  }, [search, recipeId, existingRecipe]);

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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
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
            {recipeData.ingredients.map((ingredient, index) => (
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
            {recipeData.instructions.map((instruction, index) => (
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
