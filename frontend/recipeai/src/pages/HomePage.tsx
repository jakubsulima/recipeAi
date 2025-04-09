import { useState } from "react";
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
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for recipes..."
              className="p-2 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate("Recipe", { state: { search } });
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
          </div>
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
