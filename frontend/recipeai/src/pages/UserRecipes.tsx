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
      <section className="flex flex-col max-w-4xl mx-auto w-full bg-background h-screen p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-secondary rounded-full"></div>
            <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-text text-lg font-medium">Loading recipes...</p>
          <p className="text-text/60 text-sm mt-2">Please wait a moment</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="flex flex-col max-w-4xl mx-auto w-full bg-background h-screen p-4 md:p-6">
        <article className="flex-1">
          {/* Header with decorative elements */}
          <div className="mb-6 md:mb-8 text-center relative">
            <div className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 md:h-10 md:w-10 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
                  {user ? "My Recipes" : "All Recipes"}
                </h1>
              </div>
              <p className="text-text/60 text-xs md:text-sm">
                {user
                  ? "Your personal recipe collection"
                  : "Discover delicious recipes from our community"}
              </p>
            </div>
          </div>

          {error && (
            <div className="text-accent text-center mb-6 bg-accent/10 p-4 rounded-2xl border border-accent/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 inline-block mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          )}

          {recipes && recipes.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {recipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <RecipeContainer
                    id={Number(recipe.id)}
                    title={recipe.name}
                    timeToPrepare={recipe.timeToPrepare}
                  />
                </div>
              ))}
            </div>
          ) : (
            !isLoading &&
            !error && (
              <div className="text-center text-text/50 py-12 md:py-16">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-4 text-text/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg md:text-xl font-medium">
                  No recipes found.
                </p>
                <p className="text-sm md:text-base mt-2">
                  Start creating your first recipe!
                </p>
              </div>
            )
          )}
        </article>
        <article className="pt-4 md:pt-6 pb-2">
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
