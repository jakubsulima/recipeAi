import { useEffect, useState } from "react";
import { generateRecipe } from "../lib/hooks";
import { useNavigate } from "react-router";

const HomePage = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const handleClear = () => {
    setSearch("");
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="text-center w-full md:p-11 p-">
          <h1 className="flex-col p-5">
            Welcome to AI Kitchen! &#127869; &#129302;
          </h1>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for recipes..."
            className="p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full "
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                (async () => {
                  navigate("Recipe", { state: { search } });
                })();
              }
            }}
          />
        </div>
        <section
          className="flex flex-col text-center md:flex-row p-5 md:pt-10 md:pb-10 
        "
        >
          <p className="pt-2 md:pt-0">
            ?? No idea what to cook? Let our AI suggest recipes based on your
            mood, time, and dietary preferences!
          </p>
          <p className="pt-2 md:pt-0">
            ?? Virtual Fridge � Add whatever ingredients you have at home, and
            we'll generate the perfect meal ideas for you.
          </p>
          <p className="pt-2 md:pt-0">
            ?? Save & Organize � Keep your favorite recipes in one place and
            revisit them anytime!
          </p>
        </section>
      </div>
    </>
  );
};

export default HomePage;
