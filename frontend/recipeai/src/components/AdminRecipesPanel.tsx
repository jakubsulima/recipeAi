import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/context";
import { apiClient } from "../lib/hooks";

interface Recipe {
  id: number;
  name: string;
  timeToPrepare: string;
}

const AdminRecipesPanel: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await apiClient("getAllRecipes?page=0&size=1000");
      setRecipes(data.content || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unknown error occurred while fetching recipes"
      );
      console.error(err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authContext?.user?.role === "ADMIN") {
      fetchRecipes();
    }
  }, [authContext]);

  const handleDeleteRecipe = async (recipeId: number) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        const response = await apiClient(
          `admin/deleteRecipe/${recipeId}`,
          true
        );
        if (!response.ok) {
        }
        fetchRecipes();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred while deleting recipe"
        );
        console.error(err);
      }
    }
  };

  if (!authContext || authContext.user?.role !== "ADMIN") {
    return null;
  }

  if (loading) return <div className="p-4">Loading recipes...</div>;
  if (error && recipes.length === 0)
    return (
      <div className="p-4 text-red-500">Error fetching recipes: {error}</div>
    );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Recipe Management</h2>
      {error && (
        <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded">
          Error: {error}
        </div>
      )}
      {recipes.length === 0 && !loading && !error ? (
        <p>No recipes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Time to Prepare</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {recipes.map((recipe) => (
                <tr
                  key={recipe.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-4">{recipe.id}</td>
                  <td className="py-3 px-4">{recipe.name}</td>
                  <td className="py-3 px-4">{recipe.timeToPrepare}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRecipesPanel;
