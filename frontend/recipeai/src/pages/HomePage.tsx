import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFridge } from "../context/fridgeContext";
import { useUser } from "../context/context";
import { captureEvent } from "../lib/posthog";
import { savePendingRecipeSearch } from "../lib/pendingRecipeIntent";
import ButtonsForm from "../components/ButtonsForm";
import homepageIcon160 from "../assets/dish-genie-homepage-icon-160.webp";
import homepageIcon288 from "../assets/dish-genie-homepage-icon-288.webp";
import barcodeScanningGif from "../assets/landing/barcode-scanning.gif";
import fridgeScreenshot from "../assets/landing/fridge.jpeg";
import recipeActionsScreenshot from "../assets/landing/recipe-actions.jpeg";
import recipeOptionsScreenshot from "../assets/landing/recipe-options.jpeg";
import shoppingListScreenshot from "../assets/landing/shopping-list.jpeg";

const homepageIconSrcSet = `${homepageIcon160} 160w, ${homepageIcon288} 288w`;

const landingScreenshots = [
  {
    title: "Pick from 3",
    body: "One request gives three different directions, not an endless feed.",
    src: recipeOptionsScreenshot,
    alt: "Dish Genie screen showing three generated recipe options",
  },
  {
    title: "Cook, save, or shop",
    body: "After choosing, the useful actions are right under the recipe.",
    src: recipeActionsScreenshot,
    alt: "Dish Genie recipe screen with shopping list and save recipe buttons",
  },
  {
    title: "Shop what is missing",
    body: "Turn a recipe into a checked shopping list before you leave.",
    src: shoppingListScreenshot,
    alt: "Dish Genie shopping list screen with ingredients to check off",
  },
  {
    title: "Scan groceries fast",
    body: "Add products by barcode when you restock the fridge.",
    src: barcodeScanningGif,
    alt: "Dish Genie barcode scanning screen recording",
  },
  {
    title: "Use what is already there",
    body: "Fridge ingredients can make future ideas more practical.",
    src: fridgeScreenshot,
    alt: "Dish Genie fridge screen with quick add options and saved ingredients",
  },
];

const foodTypeExamples = [
  {
    label: "Comfort",
    prompt: "comfort food",
  },
  {
    label: "Fresh",
    prompt: "fresh colorful food",
  },
  {
    label: "Spicy",
    prompt: "spicy food",
  },
  {
    label: "Crispy",
    prompt: "crispy food",
  },
];

const recipeGoals = [
  {
    label: "Quick",
    prompt: "quick",
  },
  {
    label: "No shopping",
    prompt: "no shopping",
  },
  {
    label: "Low cleanup",
    prompt: "low cleanup",
  },
  {
    label: "Use soon",
    prompt: "use soon",
  },
];

const mealTypes = ["Dinner", "Lunch", "Breakfast", "Snack"];

const foodTypeExampleLabels = foodTypeExamples.map(
  (option) => option.label,
);
const recipeGoalLabels = recipeGoals.map((option) => option.label);

const HomePage = () => {
  const [search, setSearch] = useState("");
  const [selectedFoodType, setSelectedFoodType] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [visibleScreenshotCards, setVisibleScreenshotCards] = useState<
    number[]
  >([]);
  const screenshotCardRefs = useRef<Array<HTMLElement | null>>([]);
  const navigate = useNavigate();
  const { fridgeItems } = useFridge();
  const { user } = useUser();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setVisibleScreenshotCards(landingScreenshots.map((_, index) => index));
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setVisibleScreenshotCards(landingScreenshots.map((_, index) => index));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const index = Number(
            (entry.target as HTMLElement).dataset.screenshotIndex,
          );

          setVisibleScreenshotCards((current) =>
            current.includes(index) ? current : [...current, index],
          );
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      },
    );

    screenshotCardRefs.current.forEach((card) => {
      if (card) {
        observer.observe(card);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const buildCategoryPrompt = () => {
    const foodTypePrompt = foodTypeExamples.find(
      (option) => option.label === selectedFoodType,
    )?.prompt;
    const goalPrompt = recipeGoals.find(
      (option) => option.label === selectedGoal,
    )?.prompt;
    const mealPrompt = selectedMealType
      ? `${selectedMealType.toLowerCase()} recipe`
      : undefined;

    return [foodTypePrompt, goalPrompt, mealPrompt]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const buildRecipeSearch = (searchValue = search) => {
    const categoryPrompt = buildCategoryPrompt();
    const customPrompt = searchValue.trim();
    let finalSearch = [categoryPrompt, customPrompt].filter(Boolean).join(" with ");

    if (!finalSearch) {
      finalSearch = "random recipe";
    } else if (hasIngredients) {
      const ingredientsText = fridgeItems.map((item) => item.name).join(", ");
      finalSearch += " and try to use those ingredients: " + ingredientsText;
    }
    return finalSearch;
  };

  const startRecipeFlow = (searchValue = search, cta: string) => {
    const finalSearch = buildRecipeSearch(searchValue);
    captureEvent("marketing_cta_click", {
      cta,
      hasFridgeItems: hasIngredients,
      hasCustomInput: searchValue.trim() !== "",
      selectedCategoryCount: [
        selectedFoodType,
        selectedGoal,
        selectedMealType,
      ].filter(Boolean).length,
    });

    if (!user) {
      savePendingRecipeSearch(finalSearch);
      navigate("/login", {
        state: {
          from: {
            pathname: "/Recipe",
            state: { search: finalSearch },
          },
        },
      });
      return;
    }

    setIsNavigating(true);
    navigate("Recipe", { state: { search: finalSearch } });
  };

  const handleSearch = () => {
    startRecipeFlow(
      search,
      user ? "show_me_3_ideas" : "get_my_3_dinner_ideas",
    );
  };

  const handleClear = () => {
    setSearch("");
  };

  const handleBrowseLatest = () => {
    captureEvent("marketing_cta_click", {
      cta: "browse_public_recipes",
    });
    navigate("/Recipes");
  };

  const hasIngredients = fridgeItems.length > 0;

  return (
    <>
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,var(--color-accent)_45%,transparent)_0%,transparent_72%)] blur-2xl" />
          <div className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-[radial-gradient(circle,_color-mix(in_srgb,var(--color-primary)_16%,transparent)_0%,transparent_72%)] blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,_color-mix(in_srgb,var(--color-accent)_20%,transparent)_0%,transparent_70%)] blur-2xl" />
        </div>

        <article className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-6 pt-8 md:px-8 md:pt-12">
          <div
            className="animate-fadeIn rounded-3xl border border-primary/10 bg-background/80 p-5 text-center shadow-[0_25px_65px_rgba(0,0,0,0.06)] backdrop-blur-sm md:p-8"
            style={{ animationDelay: "80ms" }}
          >
            <div className="mb-5 flex justify-center">
              <picture>
                <source
                  type="image/webp"
                  srcSet={homepageIconSrcSet}
                  sizes="(min-width: 768px) 144px, 112px"
                />
                <img
                  src="/dish-genie-homepage-icon.png"
                  alt="Dish Genie app icon with a chef hat, steam, and a cooking pot"
                  width="144"
                  height="144"
                  fetchPriority="high"
                  className="landing-icon-float h-28 w-28 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.08)] md:h-36 md:w-36"
                />
              </picture>
            </div>
            <h1 className="flex-col p-3 text-text">
              Decide what to cook tonight in seconds
            </h1>
            <p className="mb-5 text-sm text-text/70 md:text-base">
              Pick a direction and Dish Genie gives you 3 realistic recipe
              ideas without another endless feed.
            </p>
            <article className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="What sounds good?"
                className="w-full rounded-full border border-primary/20 bg-secondary/90 p-2 pr-10 text-text shadow-[0_8px_20px_rgba(0,0,0,0.04)] placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-accent"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              {search && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/70 transition-colors hover:text-accent focus:outline-none"
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
            <section className="space-y-4 pb-3 pt-5">
              <ButtonsForm
                options={foodTypeExampleLabels}
                onButtonClick={(label) => {
                  setSelectedFoodType(label);
                }}
                selectedButton={selectedFoodType}
                title="Choose a vibe"
              />
              <ButtonsForm
                options={recipeGoalLabels}
                onButtonClick={(label) => {
                  setSelectedGoal(label);
                }}
                selectedButton={selectedGoal}
                title="Need it to be"
              />
              <ButtonsForm
                options={mealTypes}
                onButtonClick={(label) => {
                  setSelectedMealType(label);
                }}
                selectedButton={selectedMealType}
                title="Meal"
              />
              <button
                onClick={handleSearch}
                disabled={isNavigating}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 font-bold text-text shadow-[0_12px_28px_color-mix(in_srgb,var(--color-accent)_45%,transparent)] transition-colors hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-wait disabled:opacity-60"
              >
                {isNavigating ? (
                  <>
                    <span className="food-loader-inline" aria-hidden="true">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="6" />
                        <path d="M3 12h3m12 0h3M12 3v3m0 12v3" />
                      </svg>
                    </span>
                    <span>Generating...</span>
                  </>
                ) : user ? (
                  "Show me 3 ideas"
                ) : (
                  "Get my 3 dinner ideas"
                )}
              </button>
            </section>
          </div>
          {!user && (
            <div className="mt-4 text-center">
              <button
                onClick={handleBrowseLatest}
                className="mobile-soft-press rounded-full border border-primary/10 bg-background/80 px-4 py-2 text-sm font-semibold text-text shadow-sm transition-colors hover:border-accent/60 hover:text-accent"
              >
                Browse latest public recipes
              </button>
            </div>
          )}
        </article>

        <section className="landing-scroll-reveal relative z-10 mx-auto mb-10 w-full max-w-6xl px-5 md:px-8">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-text">
              How Dish Genie helps after you choose
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text/65">
              Real app screens, shown as a simple flow: choose, cook, shop,
              scan, then reuse what is already in the fridge.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {landingScreenshots.map((screenshot, index) => (
              <article
                key={screenshot.src}
                ref={(node) => {
                  screenshotCardRefs.current[index] = node;
                }}
                data-screenshot-index={index}
                style={{ transitionDelay: `${index * 85}ms` }}
                className={`landing-screenshot-card landing-proof-card overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_18px_42px_rgba(0,0,0,0.08)] ${
                  visibleScreenshotCards.includes(index)
                    ? "landing-proof-card-visible"
                    : ""
                }`}
              >
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  loading="lazy"
                  className="h-72 w-full bg-secondary/40 object-contain object-top sm:h-80 xl:h-72"
                />
                <div className="p-4">
                  <h3 className="text-sm font-bold text-text">
                    {screenshot.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text/65">
                    {screenshot.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
};

export default HomePage;
