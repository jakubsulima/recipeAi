import { useState } from "react";

const PromptForm = () => {
  const controlsMeal = ["Dinner", "Lunch", "Breakfast", "Snack"];
  const controlsDiet = ["Vegetarian", "Vegan", "Gluten-Free", "Keto"];
  const controlsCuisine = ["Italian", "Mexican", "Indian", "Chinese"];
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  return (
    <>
      <section>
        <section className="flex flex-col items-center">
          <h2>Meal type</h2>
          <article className="flex flex-row">
            {controlsMeal.map((meal) => (
              <button
                key={meal}
                className={`font-semibold py-2 px-4 rounded mb-2 mr-2 ${
                  selectedMeal === meal
                    ? "bg-[#FFF9C4]"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedMeal(meal)}
              >
                {meal}
              </button>
            ))}
          </article>
          <h2 className="mt-4">Dietary restrictions</h2>
          <article className="flex flex-row">
            {controlsDiet.map((diet) => (
              <button
                key={diet}
                className={`font-semibold py-2 px-4 rounded mb-2 mr-2 ${
                  selectedDiet === diet
                    ? "bg-[#FFF9C4]"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedDiet(diet)}
              >
                {diet}
              </button>
            ))}
          </article>
          <h2 className="mt-4">Cuisine</h2>
          <article className="flex flex-row">
            {controlsCuisine.map((cuisine) => (
              <button
                key={cuisine}
                className={`font-semibold py-2 px-4 rounded mb-2 mr-2 ${
                  selectedCuisine === cuisine
                    ? "bg-[#FFF9C4]"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setSelectedCuisine(cuisine)}
              >
                {cuisine}
              </button>
            ))}
          </article>
        </section>
      </section>
    </>
  );
};

export default PromptForm;
