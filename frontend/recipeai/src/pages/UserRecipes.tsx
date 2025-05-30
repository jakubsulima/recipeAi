import { useState, useEffect } from "react";
import { RecipeData } from "./RecipePage";
import { AJAX } from "../lib/hooks";
import { useUser } from "../context/context";

const Recipes = () => {
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, loading: userLoading } = useUser();
  const [error, setError] = useState<string>("");

  const fetchAllRecipes = async () => {
    try {
      const response = await AJAX("getAllRecipes", false);
      console.log("Fetched all recipes:", response);
      setRecipes(response);
    } catch (error) {
      setError("Error fetching recipes");
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRecipes = async () => {
      if (userLoading) {
        return;
      }

      if (user && user.id) {
        try {
          const response = await AJAX(`getUserRecipes/${user.id}`);
          console.log("Fetched recipes:", response);
          setRecipes(response);
        } catch (error) {
          setError("Error fetching recipes");
          console.error("Error fetching recipes:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        fetchAllRecipes();
      }
    };
    fetchUserRecipes();
  }, [user, userLoading]);

  if (isLoading || userLoading) {
    return <div>Loading recipes...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">My Recipes</h1>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {recipes && recipes.length > 0 ? (
        <div className="space-y-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id || recipe.name}
              className="bg-white shadow-md rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold mb-2">{recipe.name}</h2>
              {recipe.description && (
                <p className="text-gray-600 mb-4">{recipe.description}</p>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Ingredients:</h3>
                {recipe.ingredients && recipe.ingredients.length > 0 ? ( // Check ingredients
                  <ul className="list-disc pl-5 space-y-1">
                    {recipe.ingredients.map(
                      (ingredient: any, index: number) => (
                        <li key={index} className="text-gray-700">
                          {ingredient.amount} {ingredient.unit}{" "}
                          {ingredient.name}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500">No ingredients listed.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Instructions:</h3>
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <ol className="list-decimal pl-5 space-y-2">
                    {recipe.instructions.map((step: string, index: number) => (
                      <li key={index} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-500">No instructions provided.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="text-center text-gray-500">No recipes found.</div>
        )
      )}
    </div>
  );
};

export default Recipes;
