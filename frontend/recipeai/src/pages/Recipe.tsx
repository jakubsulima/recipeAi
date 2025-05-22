import { useLocation, useParams } from "react-router";
import { AJAX, generateRecipe } from "../lib/hooks";
import { useState, useEffect } from "react";
import { r } from "react-router/dist/development/fog-of-war-BLArG-qZ";

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
}

const Recipe = () => {
  const location = useLocation();
  const params = useParams();
  const recipeId = params.id; // Get ID from URL if present

  const { search, existingRecipe } = location.state || {};
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRecipe = async () => {
      const response = await AJAX(`getRecipe/${recipeId}`);
      if (response) {
        setRecipeData(response);
        setIsLoading(false);
      } else {
        setError("Recipe not found");
        setIsLoading(false);
      }
    };
    if (existingRecipe) {
      setRecipeData(existingRecipe);
      setIsLoading(false);
      return;
    }

    if (recipeId) {
      setIsLoading(false);
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

  const loadRecipe = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      const response = await generateRecipe(searchTerm, ["Onion", "Tomato"]);

      const cleanedResponse =
        typeof response === "string"
          ? response.replace(/```json|```/g, "").trim()
          : response;
      // Check if the response is a valid JSON string
      console.log("Response:", cleanedResponse);
      const parsedData =
        typeof cleanedResponse === "string"
          ? JSON.parse(cleanedResponse)
          : cleanedResponse;

      setRecipeData(parsedData);
    } catch (error) {
      console.error("Error generating recipe:", error);
      setError("Failed to load recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const saveRecipe = async (searchTerm: string) => {
    try {
      setIsLoading(true);
      console.log(recipeData);
      const response = await AJAX("addRecipe", true, {
        name: recipeData?.name,
        ingredients: recipeData?.ingredients,
        instructions: recipeData?.instructions,
      });
    } catch (error) {
      console.error("Error saving recipe:", error);
      setError("Failed to save recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Loading recipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl text-red-500">{error}</h2>
        <p className="mt-4">Please go back and try searching again.</p>
      </div>
    );
  }

  if (!recipeData) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl">No recipe found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{recipeData.name}</h1>
      {recipeData.description && (
        <p className="text-gray-600 mb-6">{recipeData.description}</p>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
        {recipeData.ingredients && recipeData.ingredients.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2">
            {recipeData.ingredients.map((ingredient, index) => (
              <li key={index} className="text-gray-700">
                {ingredient.amount != 0 ? ingredient.amount : ""}{" "}
                {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No ingredients listed.</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
        {recipeData.instructions && recipeData.instructions.length > 0 ? (
          <ol className="list-decimal pl-6 space-y-4">
            {recipeData.instructions.map((step, index) => (
              <li key={index} className="text-gray-700">
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500">No instructions provided.</p>
        )}
      </div>
      {search && (
        <div className="mb-8">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => saveRecipe(search)}
          >
            Save Recipe
          </button>
        </div>
      )}
    </div>
  );
};

export default Recipe;
