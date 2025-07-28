import * as yup from "yup";

interface PreferencesFormProps {
  dietOptions: string[];
  onSavePreferences: (preferences: {
    diet: string;
    dislikedIngredients: string[];
  }) => void;
}

const schema = yup.object().shape({
  diet: yup.string().required("Diet preference is required"),
  dislikedIngredients: yup
    .string()
    .required("Disliked ingredients are required")
    .test(
      "no-duplicates",
      "Disliked ingredients must not contain duplicates",
      (value) => {
        if (!value) return true;
        const ingredients = value.split(",").map((i) => i.trim());
        return new Set(ingredients).size === ingredients.length;
      }
    ),
});

const PreferencesForm = ({
  dietOptions,
  onSavePreferences,
}: PreferencesFormProps) => {
  return (
    <>
      <h2>User Preferences</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const diet = form.diet.value;
          const dislikedIngredients = form.dislikedIngredients.value
            .split(",")
            .map((ingredient) => ingredient.trim());
          onSavePreferences({ diet, dislikedIngredients });
        }}
      >
        <label>
          Diet:
          <select>
            {dietOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Disliked Ingredients:
          <input type="text" placeholder="Enter disliked ingredients" />
        </label>
        <button type="submit">Save Preferences</button>
      </form>
    </>
  );
};

export default PreferencesForm;
