import { useState } from "react";
import { useNavigate } from "react-router";
import { useFridge } from "../context/fridgeContext";
import ButtonsForm from "../components/ButtonsForm";

const HomePage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { fridgeItems } = useFridge();
  const controlsCuisine = ["Italian", "Mexican", "Indian", "Chinese"];
  const controlsMeal = ["Dinner", "Lunch", "Breakfast", "Snack"];
  const controlsTime = ["Quick", "Moderate", "Slow"];
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const handleSearch = () => {
    let finalSearch = search;
    if (!search.trim()) {
      finalSearch = "random recipe";
    } else if (hasIngredients && search.trim()) {
      const ingredientsText = fridgeItems.map((item) => item.name).join(", ");
      finalSearch += " and try to use those ingredients: " + ingredientsText;
    }
    if (selectedMeal) {
      finalSearch += ` for ${selectedMeal}`;
    }
    if (selectedCuisine) {
      finalSearch += ` in ${selectedCuisine} cuisine`;
    }
    if (selectedTime) {
      finalSearch += ` in ${selectedTime} time`;
    }
    navigate("Recipe", { state: { search: finalSearch } });
  };

  const handleClear = () => {
    setSearch("");
  };

  const hasIngredients = fridgeItems.length > 0;

  return (
    <>
      <section className="flex flex-col">
        <article className="text-center w-full md:p-11 pr-5 pl-5">
          <h1 className="flex-col p-5">
            Welcome to AI Kitchen! &#127869; &#129302;
          </h1>
          <article className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Create recipe"
              className="p-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
            {search && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </article>
          <section className="pb-5 pt-5 space-y-4">
            <ButtonsForm
              options={controlsMeal}
              onButtonClick={setSelectedMeal}
              selectedButton={selectedMeal}
              title="Select Meal Type:"
            ></ButtonsForm>
            <ButtonsForm
              options={controlsCuisine}
              onButtonClick={setSelectedCuisine}
              selectedButton={selectedCuisine}
              title="Select Cuisine:"
            ></ButtonsForm>
            <ButtonsForm
              options={controlsTime}
              onButtonClick={setSelectedTime}
              selectedButton={selectedTime}
              title="Select Time to Prepare:"
            ></ButtonsForm>
            <button
              onClick={handleSearch}
              className="w-40 bg-primary text-black font-bold py-2 px-4 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark mt-6 sm:w-62 "
            >
              Generate Recipe
            </button>
          </section>
        </article>

        <section className="flex bg-primary flex-col text-center md:flex-row p-5 md:pt-10 md:pb-10 ">
          <p className="pt-2 md:pt-0">
            🧑‍🍳 No idea what to cook? Let our AI suggest recipes based on your
            mood, time, and dietary preferences!
          </p>
          <p className="pt-2 md:pt-0">
            🥗 Virtual Fridge 🍱 Add whatever ingredients you have at home, and
            we'll generate the perfect meal ideas for you.
          </p>
          <p className="pt-2 md:pt-0">
            🍽️ Save & Organize Keep your favorite recipes in one place and
            revisit them anytime!
          </p>
        </section>
      </section>
    </>
  );
};

export default HomePage;
