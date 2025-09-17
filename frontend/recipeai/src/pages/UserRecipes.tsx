import { useState, useEffect } from "react";
import { RecipeData } from "./RecipePage";
import { apiClient } from "../lib/hooks";
import { useUser } from "../context/context";
import RecipeContainer from "../components/RecipeContainer";

const Recipes = () => {
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, loading: userLoading } = useUser();
  const [error, setError] = useState<string>("");

  const fetchAllRecipes = async () => {
    try {
      const response = await apiClient("getAllRecipes", false);
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
          const response = await apiClient(`getUserRecipes/${user.id}`);
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
    <>
      <div className="p-4 w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">My Recipes</h1>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {recipes && recipes.length > 0 ? (
          <div className="space-y-6">
            {recipes.map((recipe) => (
              <RecipeContainer
                key={recipe.id}
                id={Number(recipe.id)}
                title={recipe.name}
                timeToPrepare={recipe.timeToPrepare}
              />
            ))}
          </div>
        ) : (
          !isLoading &&
          !error && (
            <div className="text-center text-gray-500">No recipes found.</div>
          )
        )}
      </div>
    </>
  );
};

export default Recipes;
