import { useState, useEffect } from "react";
import { RecipeData } from "./RecipePage";
import { apiClient } from "../lib/hooks";
import { useUser } from "../context/context";
import RecipeContainer from "../components/RecipeContainer";
import PaginationControls from "../components/PaginationControls";

const Recipes = () => {
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { user, loading: userLoading } = useUser();
  const [error, setError] = useState<string>("");

  const RECIPES_PER_PAGE = 9;

  const fetchAllRecipes = async () => {
    try {
      const response = await apiClient("getAllRecipes", false);
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
          const response = await apiClient(
            `getUserRecipes/${user.id}?page=${currentPage}&size=${RECIPES_PER_PAGE}`,
            false
          );
          setRecipes(response.content);
          setTotalPages(response.totalPages);
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
  }, [user, userLoading, currentPage]);

  if (isLoading || userLoading) {
    return <div>Loading recipes...</div>;
  }

  return (
    <>
      <section className="flex flex-col max-w-3xl mx-auto w-full">
        <article className="p-4 ">
          <h1 className="text-2xl font-bold mb-6 text-center">My Recipes</h1>
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
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
        </article>
        <article>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </article>
      </section>
    </>
  );
};

export default Recipes;
