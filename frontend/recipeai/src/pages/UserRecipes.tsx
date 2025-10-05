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
      const response = await apiClient(
        `getAllRecipes?page=${currentPage}&size=${RECIPES_PER_PAGE}`,
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
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-background">
        <div className="text-text text-xl">Loading recipes...</div>
      </div>
    );
  }

  return (
    <>
      <section className="flex flex-col max-w-4xl mx-auto w-full bg-background h-screen p-6">
        <article className="flex-1 ">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-text mb-2 tracking-tight">
              {user ? "My Recipes" : "All Recipes"}
            </h1>
            <p className="text-text/60 text-sm">
              {user
                ? "Your personal recipe collection"
                : "Discover delicious recipes from our community"}
            </p>
          </div>
          {error && (
            <div className="text-accent text-center mb-6 bg-accent/10 p-4 rounded-2xl">
              {error}
            </div>
          )}
          {recipes && recipes.length > 0 ? (
            <div className="space-y-4">
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
              <div className="text-center text-text/50 py-12">
                <p className="text-lg">No recipes found.</p>
                <p className="text-sm mt-2">
                  Start creating your first recipe!
                </p>
              </div>
            )
          )}
        </article>
        <article className="pt-6 pb-2">
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
