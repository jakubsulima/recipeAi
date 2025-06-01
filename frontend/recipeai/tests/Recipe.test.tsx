import React from "react";
import { describe, test, expect, vi, beforeEach } from "vitest"; // Correctly import test
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation, useParams } from "react-router-dom"; // Import from react-router-dom

import { AJAX, generateRecipe } from "../src/lib/hooks";
import { useFridge } from "../src/context/fridgeContext";
import RecipePage from "../src/pages/RecipePage";
import { AuthProvider } from "../src/context/context"; // Corrected import to AuthProvider

// Mock the hooks
vi.mock("../src/lib/hooks", () => ({
  AJAX: vi.fn(),
  generateRecipe: vi.fn(),
}));

// Mock react-router-dom hooks
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useLocation: vi.fn(),
  };
});

// Mock the fridge context
vi.mock("../src/context/fridgeContext", () => ({
  useFridge: vi.fn(),
}));

// Define mocks using vi.mocked for better type safety
const mockUseLocation = vi.mocked(useLocation);
const mockUseParams = vi.mocked(useParams);
const mockUseFridge = vi.mocked(useFridge);
const mockAJAX = vi.mocked(AJAX);
const mockGenerateRecipe = vi.mocked(generateRecipe);

interface SetupMocksArgs {
  fridgeItems?: any[]; // Adjust type as per FridgeIngredient[] if available
  loadingFridge?: boolean;
  fridgeError?: string;
  getFridgeItemNames?: () => string[];
  params?: { recipeName?: string };
  locationState?: { recipe?: any } | null; // Allow null
  ajaxResponse?: any;
  generateRecipeResponse?: any;
}

function setupMocks({
  fridgeItems = [],
  loadingFridge = false,
  fridgeError = "",
  getFridgeItemNames = () => [],
  params = { recipeName: "Test Recipe" },
  locationState = null,
  ajaxResponse = {},
  generateRecipeResponse = {
    recipeName: "Test Recipe",
    ingredients: [{ name: "Ingredient 1", quantity: "1 cup" }],
    instructions: ["Step 1"],
    timeToPrepare: "30 minutes",
  },
}: SetupMocksArgs = {}) {
  // Added type for the destructured argument
  mockUseParams.mockReturnValue(params as any); // Cast to any if type is complex
  mockUseLocation.mockReturnValue({
    state: locationState,
    pathname: `/recipe/${params.recipeName || "default"}`,
    search: "",
    hash: "",
    key: "test-key",
  } as any); // Cast to any for simplicity or define a proper Location type

  mockUseFridge.mockReturnValue({
    fridgeItems,
    setFridgeItems: vi.fn(),
    loading: loadingFridge,
    error: fridgeError,
    addFridgeItem: vi.fn().mockResolvedValue(undefined),
    removeFridgeItem: vi.fn().mockResolvedValue(undefined),
    refreshFridgeItems: vi.fn().mockResolvedValue(undefined),
    getFridgeItemNames: vi.fn().mockImplementation(getFridgeItemNames),
  });
  mockAJAX.mockReset(); // Reset before setting new behavior
  mockGenerateRecipe.mockReset();

  if (typeof ajaxResponse === "function") {
    mockAJAX.mockImplementation(ajaxResponse);
  } else {
    mockAJAX.mockResolvedValue(ajaxResponse);
  }

  if (typeof generateRecipeResponse === "function") {
    mockGenerateRecipe.mockImplementation(generateRecipeResponse);
  } else {
    mockGenerateRecipe.mockResolvedValue(generateRecipeResponse);
  }
}

describe("RecipePage", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks before each test
    // Setup default mocks for each test, can be overridden
    setupMocks();
  });

  test("renders loading state initially when fridge is loading", () => {
    setupMocks({ loadingFridge: true });
    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders error state if fridge has error", () => {
    setupMocks({ fridgeError: "Failed to load fridge" });
    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(
      screen.getByText("Error: Failed to load fridge")
    ).toBeInTheDocument();
  });

  test("renders recipe details from location state", async () => {
    const recipeFromState = {
      recipeName: "State Recipe",
      ingredients: [{ name: "State Ingredient", quantity: "2 cups" }],
      instructions: ["State Step 1"],
      timeToPrepare: "45 minutes",
    };
    setupMocks({ locationState: { recipe: recipeFromState } });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("State Recipe")).toBeInTheDocument();
    });
    expect(screen.getByText("State Ingredient - 2 cups")).toBeInTheDocument();
    expect(screen.getByText("State Step 1")).toBeInTheDocument();
    expect(screen.getByText("Time to prepare: 45 minutes")).toBeInTheDocument();
  });

  test("generates a new recipe if no location state and fridge items are available", async () => {
    const generatedRecipe = {
      recipeName: "Generated Recipe",
      ingredients: [{ name: "Generated Ingredient", quantity: "3 units" }],
      instructions: ["Generated Step 1"],
      timeToPrepare: "1 hour",
    };
    setupMocks({
      getFridgeItemNames: () => ["Apple", "Banana"],
      generateRecipeResponse: generatedRecipe,
      locationState: null, // Ensure no recipe in location state
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockGenerateRecipe).toHaveBeenCalledWith(["Apple", "Banana"]);
    });
    await waitFor(() => {
      expect(screen.getByText("Generated Recipe")).toBeInTheDocument();
    });
    expect(
      screen.getByText("Generated Ingredient - 3 units")
    ).toBeInTheDocument();
    expect(screen.getByText("Generated Step 1")).toBeInTheDocument();
    expect(screen.getByText("Time to prepare: 1 hour")).toBeInTheDocument();
  });

  test("displays message if no fridge items and no recipe in state or URL", async () => {
    setupMocks({
      getFridgeItemNames: () => [],
      locationState: null,
      params: { recipeName: undefined }, // No recipe name in URL
      // Mock AJAX for getRecipeByName to return nothing or an error
      ajaxResponse: async (url: string) => {
        if (url.startsWith("getRecipeByName/")) {
          return Promise.resolve(null); // Or reject to simulate not found
        }
        return Promise.resolve({});
      },
    });

    render(
      <MemoryRouter initialEntries={["/recipe/"]}>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "No recipe data found. Add items to your fridge to generate one or check out your saved recipes."
        )
      ).toBeInTheDocument();
    });
  });

  test("handles error during recipe generation", async () => {
    setupMocks({
      getFridgeItemNames: () => ["Tomato"],
      generateRecipeResponse: () => Promise.reject(new Error("AI failed")),
      locationState: null,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Error generating recipe: AI failed")
      ).toBeInTheDocument();
    });
  });

  test("saves recipe to database", async () => {
    const recipeToSave = {
      recipeName: "Save Me Recipe",
      ingredients: [{ name: "Save Ingredient", quantity: "1" }],
      instructions: ["Save Step"],
      timeToPrepare: "10 mins",
    };
    setupMocks({
      locationState: { recipe: recipeToSave },
      ajaxResponse: { message: "Recipe saved" }, // Mock for saveRecipe
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Save Me Recipe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /save recipe/i }));

    await waitFor(() => {
      expect(mockAJAX).toHaveBeenCalledWith("saveRecipe", true, recipeToSave);
    });
    // await waitFor(() => expect(screen.getByText("Recipe saved successfully!")).toBeInTheDocument());
  });

  test("handles error when saving recipe", async () => {
    const recipeToSave = {
      recipeName: "Fail Save Recipe",
      ingredients: [{ name: "Fail Ingredient", quantity: "1" }],
      instructions: ["Fail Step"],
      timeToPrepare: "5 mins",
    };
    setupMocks({
      locationState: { recipe: recipeToSave },
      ajaxResponse: () => Promise.reject(new Error("DB error")), // Mock for saveRecipe
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Fail Save Recipe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /save recipe/i }));

    await waitFor(() => {
      expect(mockAJAX).toHaveBeenCalledWith("saveRecipe", true, recipeToSave);
    });
    await waitFor(() => {
      expect(
        screen.getByText("Error saving recipe: DB error")
      ).toBeInTheDocument();
    });
  });

  test("displays recipe from URL parameter if no location state", async () => {
    const recipeNameFromUrl = "RecipeFromURL";
    const recipeFromDB = {
      recipeName: "DB Recipe",
      ingredients: [{ name: "DB Ingredient", quantity: "1 kg" }],
      instructions: ["DB Step 1"],
      timeToPrepare: "20 minutes",
    };

    setupMocks({
      params: { recipeName: recipeNameFromUrl },
      locationState: null,
      getFridgeItemNames: () => [],
      ajaxResponse: async (
        url: string,
        _isProtected?: boolean,
        _body?: any
      ) => {
        if (url === `getRecipeByName/${recipeNameFromUrl}`) {
          return Promise.resolve(recipeFromDB);
        }
        return Promise.resolve({});
      },
    });

    render(
      <MemoryRouter initialEntries={[`/recipe/${recipeNameFromUrl}`]}>
        <AuthProvider>
          <RecipePage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockAJAX).toHaveBeenCalledWith(
        `getRecipeByName/${recipeNameFromUrl}`,
        false
      );
    });

    await waitFor(() => {
      expect(screen.getByText("DB Recipe")).toBeInTheDocument();
    });
    expect(screen.getByText("DB Ingredient - 1 kg")).toBeInTheDocument();
    expect(screen.getByText("DB Step 1")).toBeInTheDocument();
    expect(screen.getByText("Time to prepare: 20 minutes")).toBeInTheDocument();
  });
});
