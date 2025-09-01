import { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/context";
import { useNavigate } from "react-router-dom";
import OptionsForm from "../components/OptionsForm";
import { apiClient } from "../lib/hooks";

const MePage = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, getUserPreferences } = useUser();

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [dietOptions, setDietOptions] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState<string>("");
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchDietOptions = async () => {
      try {
        const response = await apiClient("user/getDiets");
        setDietOptions(response);
      } catch (error) {
        console.error("Failed to fetch diet options:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDietOptions();
  }, []);

  const fetchUserPreferences = useCallback(async () => {
    if (!user || userLoading || preferencesLoaded) return;
    try {
      await getUserPreferences();
      setPreferencesLoaded(true);
    } catch (error) {
      setError("Failed to fetch user preferences");
      console.error("Error fetching user preferences:", error);
    }
  }, [user, userLoading, getUserPreferences, preferencesLoaded]);

  useEffect(() => {
    fetchUserPreferences();
  }, [fetchUserPreferences]);

  const handleUpdatePreferences = async (
    updateFn: () => Promise<any>,
    successMessage: string,
    errorMessage: string
  ) => {
    setError("");
    try {
      await updateFn();
      await getUserPreferences(); // Refresh preferences after update
      // Optionally show a success message
    } catch (error) {
      setError(errorMessage);
      console.error(errorMessage, error);
    }
  };

  const addDislikedIngredient = () => {
    if (!newIngredient.trim()) return;
    const currentDisliked = user?.preferences?.dislikedIngredients || [];
    if (currentDisliked.includes(newIngredient.trim().toLowerCase())) {
      setError("This ingredient is already in your disliked list");
      return;
    }
    handleUpdatePreferences(
      () =>
        apiClient(
          "user/addDislikedIngredient",
          true,
          newIngredient.trim().toLowerCase()
        ),
      "Ingredient added",
      "Failed to add disliked ingredient"
    ).then(() => setNewIngredient(""));
  };

  const removeDislikedIngredient = (ingredientToRemove: string) => {
    handleUpdatePreferences(
      () =>
        apiClient(
          "user/removeDislikedIngredient",
          true,
          ingredientToRemove.toLowerCase()
        ),
      "Ingredient removed",
      "Failed to remove disliked ingredient"
    );
  };

  const handleChangeDiet = (diet: string) => {
    handleUpdatePreferences(
      () => apiClient("user/changeDiet", true, diet),
      "Diet updated",
      "Failed to change diet"
    );
  };

  if (userLoading || loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          My Preferences
        </h1>

        {error && (
          <div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Diet Preferences Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">
              Dietary Plan
            </h2>
            <OptionsForm
              name="diet"
              options={dietOptions}
              currentOptions={user.preferences?.diet || ""}
              onSaveOptions={handleChangeDiet}
              showSubmitButton={true}
              buttonText="Update Diet"
            />
          </div>

          {/* Disliked Ingredients Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Disliked Ingredients
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDislikedIngredient()}
                placeholder="e.g., Olives"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={addDislikedIngredient}
                className="px-4 py-2 bg-primary text-black rounded-md focus:outline-none focus:ring-2 focus:ring-main"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {user.preferences?.dislikedIngredients?.length > 0 ? (
                user.preferences.dislikedIngredients.map(
                  (ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                    >
                      <span className="capitalize">{ingredient}</span>
                      <button
                        onClick={() => removeDislikedIngredient(ingredient)}
                        className="text-black hover:text-red-500 text-xl font-bold transition-colors"
                        title={`Remove ${ingredient}`}
                      >
                        &times;
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-gray-500 text-center py-4">
                  {preferencesLoaded
                    ? "No disliked ingredients added."
                    : "Loading..."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MePage;
