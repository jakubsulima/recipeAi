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
  const [displayDietOptions, setDisplayDietOptions] = useState<string[]>([]); // State for display-friendly options
  const [newIngredient, setNewIngredient] = useState<string>("");
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchDietOptions = async () => {
      try {
        const response: string[] = await apiClient("user/getDiets");
        setDietOptions(response); // Store original values

        // Create and store display-friendly values (e.g., capitalized)
        const formattedForDisplay = response.map(
          (diet) => diet.charAt(0).toUpperCase() + diet.slice(1).toLowerCase()
        );
        setDisplayDietOptions(formattedForDisplay);
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
      await getUserPreferences();
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
    return (
      <div className="p-4 text-center bg-background min-h-screen text-text">
        Loading...
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-text mb-8">My Preferences</h1>

        {error && (
          <div
            className="mb-6 p-4 bg-accent/20 border border-accent text-accent rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-secondary p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-text mb-4">
              Dietary Plan
            </h2>
            <OptionsForm
              name="diet"
              options={dietOptions}
              displayOptions={displayDietOptions} // Pass the display options here
              currentOptions={user.preferences?.diet || ""}
              onSaveOptions={handleChangeDiet}
              showSubmitButton={true}
              buttonText="Update Diet"
            />
          </div>

          <div className="bg-secondary p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-text mb-4">
              Disliked Ingredients
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDislikedIngredient()}
                placeholder="e.g., Olives"
                className="flex-1 px-3 py-2 border border-primary/20 bg-background text-text rounded-md focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-text/50"
              />
              <button
                onClick={addDislikedIngredient}
                className="px-4 py-2 bg-accent text-text rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-accent hover:bg-accent/90 transition-colors"
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
                      className="flex items-center justify-between bg-background px-3 py-2 rounded-md"
                    >
                      <span className="capitalize text-text">{ingredient}</span>
                      <button
                        onClick={() => removeDislikedIngredient(ingredient)}
                        className="text-text/50 hover:text-accent text-xl font-bold transition-colors"
                        title={`Remove ${ingredient}`}
                      >
                        &times;
                      </button>
                    </div>
                  )
                )
              ) : (
                <p className="text-text/70 text-center py-4">
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
