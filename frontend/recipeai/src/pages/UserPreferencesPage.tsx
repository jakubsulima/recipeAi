import { useEffect, useState, useCallback } from "react";
import { useUser } from "../context/context";
import { useNavigate } from "react-router-dom";
import OptionsForm from "../components/OptionsForm";
import { apiClient } from "../lib/hooks";
import FoodLoadingScreen from "../components/FoodLoadingScreen";

const MePage = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading, getUserPreferences } = useUser();

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
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
    successMsg: string,
    errorMessage: string
  ) => {
    setError("");
    setSuccessMessage("");
    try {
      await updateFn();
      await getUserPreferences();
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(""), 3000);
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
      <FoodLoadingScreen
        title="Loading preferences..."
        subtitle="Getting your taste profile ready"
      />
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const dislikedIngredients = user.preferences?.dislikedIngredients || [];
  const activeDiet = user.preferences?.diet || "Not set";
  const currentDiet = user.preferences?.diet || "";

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8 overflow-hidden rounded-3xl border border-accent/35 bg-secondary p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-text sm:text-4xl">My Preferences</h1>
          <p className="mt-2 max-w-2xl text-text/70">
            One place to tune your diet and ingredient dislikes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-text">
              Diet: {activeDiet}
            </span>
            <span className="rounded-full border border-accent/35 bg-background px-3 py-1.5 text-sm text-text/75">
              {dislikedIngredients.length} disliked ingredient{dislikedIngredients.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 flex items-start gap-2 rounded-xl border border-accent/45 bg-accent/10 p-4 text-text"
            role="alert"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-background">
              !
            </span>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            className="mb-6 flex items-start gap-2 rounded-xl border border-accent/45 bg-accent/15 p-4 text-text"
            role="status"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
              ✓
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="rounded-2xl border border-primary/10 bg-secondary p-5 shadow-sm sm:p-6">
          <div className="mb-6 rounded-xl border border-primary/10 bg-background p-4">
            <h2 className="mb-1 text-xl font-semibold text-text">Dietary Plan</h2>
            <p className="mb-3 text-sm text-text/60">Pick one option. It updates immediately.</p>
            <OptionsForm
              name="diet"
              options={dietOptions}
              displayOptions={displayDietOptions}
              currentOptions={currentDiet}
              onChange={(value) => {
                if (value && value !== currentDiet) {
                  handleChangeDiet(value);
                }
              }}
              showSubmitButton={false}
            />
          </div>

          <div className="rounded-xl border border-primary/10 bg-background p-4">
            <h2 className="mb-1 text-xl font-semibold text-text">Disliked Ingredients</h2>
            <p className="mb-3 text-sm text-text/60">Keep this list short and specific for better recipe matches.</p>

            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDislikedIngredient()}
                placeholder="e.g., Olives"
                className="flex-1 rounded-lg border border-primary/20 bg-background px-3 py-2.5 text-text placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={addDislikedIngredient}
                className="rounded-lg bg-accent px-4 py-2.5 font-semibold text-text transition-colors hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              {dislikedIngredients.length > 0 ? (
                dislikedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-primary/10 bg-secondary px-3 py-2.5"
                  >
                    <span className="capitalize font-medium text-text">{ingredient}</span>
                    <button
                      onClick={() => removeDislikedIngredient(ingredient)}
                      className="rounded-md px-2 py-0.5 text-lg font-bold text-text/45 transition-colors hover:bg-accent/15 hover:text-accent"
                      title={`Remove ${ingredient}`}
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-primary/20 py-4 text-center text-text/70">
                  {preferencesLoaded ? "No disliked ingredients added." : "Loading..."}
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
