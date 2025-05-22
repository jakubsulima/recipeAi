import { useState, useEffect } from "react";
import Recipe, { RecipeData, RecipeIngredient } from "./Recipe";
import { AJAX } from "../lib/hooks";
import { useUser } from "../context/context"; // Import useUser
import { set } from "react-hook-form";

const Recipes = () => {
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, loading: userLoading } = useUser();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchRecipes = async () => {
      if (userLoading) {
        // Wait for user data to load
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
        console.log("User not logged in or ID not available");
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [user, userLoading]); // Add user and userLoading as dependencies
  useEffect(() => {
    console.log("Recipes state updated:", recipes);
  }, [recipes]);

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
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-700">
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No ingredients listed.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Instructions:</h3>
                {recipe.instructions && recipe.instructions.length > 0 ? ( // Check instructions
                  <ol className="list-decimal pl-5 space-y-2">
                    {recipe.instructions.map((step, index) => (
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
