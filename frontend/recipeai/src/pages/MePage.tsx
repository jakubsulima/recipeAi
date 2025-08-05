import { use, useEffect, useState } from "react";
import { useUser } from "../context/context";
import { useNavigate } from "react-router";
import DietForm from "../components/DietForm";
import { apiClient } from "../lib/hooks";

const MePage = () => {
  const navigate = useNavigate();
  const {
    user,
    loading: userLoading,
    getUserPreferences,
    updateUserPreferences,
  } = useUser();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [dietOptions, setDietOptions] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>("");

  useEffect(() => {
    const fetchDietOptions = async () => {
      try {
        const response = await apiClient("user/getDiets");
        console.log("Diet options fetched:", response);
        setDietOptions(response);
      } catch (error) {
        console.error("Failed to fetch diet options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDietOptions();
  }, []);

  useEffect(() => {
    if (!user || userLoading) return;

    const fetchUserPreferences = async () => {
      try {
        await getUserPreferences();
      } catch (error) {
        setError("Failed to fetch user preferences");
        console.error("Error fetching user preferences:", error);
      }
    };

    fetchUserPreferences();
  }, [userLoading]);

  const addDislikedIngredient = async () => {
    if (!newIngredient.trim()) return;

    try {
      const currentDisliked = user?.preferences?.dislikedIngredients || [];

      // Check if ingredient already exists
      if (currentDisliked.includes(newIngredient.trim())) {
        setError("This ingredient is already in your disliked list");
        return;
      }

      const updatedDisliked = [...currentDisliked, newIngredient.trim()];
      await updateUserPreferences({ dislikedIngredients: updatedDisliked });
      setNewIngredient("");
      setError("");
    } catch (error) {
      setError("Failed to add disliked ingredient");
      console.error("Error adding disliked ingredient:", error);
    }
  };

  const removeDislikedIngredient = async (ingredientToRemove: string) => {
    try {
      const currentDisliked = user?.preferences?.dislikedIngredients || [];
      const updatedDisliked = currentDisliked.filter(
        (ingredient) => ingredient !== ingredientToRemove
      );
      await updateUserPreferences({ dislikedIngredients: updatedDisliked });
      setError("");
    } catch (error) {
      setError("Failed to remove disliked ingredient");
      console.error("Error removing disliked ingredient:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addDislikedIngredient();
    }
  };

  if (!userLoading && !user) {
    navigate("/login");
    return null;
  }
  if (userLoading) {
    return <div>Loading user data...</div>;
  }
  if (user && !userLoading) {
    return (
      <section className="p-4 w-full mx-auto max-w-5xl">
        <h2 className="text-xl font-bold mb-4">My Preferences</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <article className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg">
              Diet: {user.preferences?.diet || "Not specified"}
            </p>
            <DietForm
              dietOptions={dietOptions}
              currentDiet={user.preferences?.diet || ""}
              onSaveDiet={async (diet) => {
                await updateUserPreferences({ diet });
              }}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium mb-2">
                Add Disliked Ingredient:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter ingredient name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addDislikedIngredient}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <p className="text-lg font-medium mb-2">Disliked Ingredients:</p>
              {user.preferences?.dislikedIngredients?.length > 0 ? (
                <div className="space-y-2">
                  {user.preferences.dislikedIngredients.map(
                    (ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                      >
                        <span>{ingredient}</span>
                        <button
                          onClick={() => removeDislikedIngredient(ingredient)}
                          className="text-red-500 hover:text-red-700 font-bold"
                          title="Remove ingredient"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-500">None</p>
              )}
            </div>
          </div>
        </article>
      </section>
    );
  }
};

export default MePage;
