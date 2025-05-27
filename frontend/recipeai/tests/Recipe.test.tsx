import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Recipe from "../src/pages/Recipe";
import * as hooks from "../src/lib/hooks";
import * as reactRouter from "react-router";

// Mock the generateRecipe function
vi.mock("../src/lib/hooks", () => ({
  generateRecipe: vi.fn(),
}));

// Mock the react-router hooks
vi.mock("react-router", () => ({
  ...vi.importActual("react-router"),
  useParams: vi.fn(),
  useLocation: vi.fn(),
}));

// Mock the fridge context
vi.mock("../src/context/fridgeContext", () => ({
  useFridge: vi.fn(() => ({
    getFridgeItemNames: vi.fn(() => ["Onion", "Tomato"]),
  })),
}));

// Sample recipe data for tests
const mockRecipeData = {
  name: "Test Recipe",
  description: "A test recipe description",
  ingredients: [
    { name: "Ingredient 1", amount: "1", unit: "cup" },
    { name: "Ingredient 2", amount: "2", unit: "tbsp" },
  ],
  instructions: ["Step 1 of the recipe", "Step 2 of the recipe"],
};

// Setup function to configure mocks
const setupMocks = ({
  id = null,
  search = null,
  existingRecipe = null,
  generateRecipeResult = null,
}: {
  id?: string | null;
  search?: string | null;
  existingRecipe?: any;
  generateRecipeResult?: any;
} = {}) => {
  // Access the mocks directly instead of using spyOn
  const useParamsMock = reactRouter.useParams as vi.MockedFunction<
    typeof reactRouter.useParams
  >;
  useParamsMock.mockReturnValue(id ? { id } : {});

  const useLocationMock = reactRouter.useLocation as vi.MockedFunction<
    typeof reactRouter.useLocation
  >;
  useLocationMock.mockReturnValue({
    pathname: "/Recipe",
    search: "",
    state: { search, existingRecipe },
    hash: "",
  });

  // Configure generateRecipe mock
  if (generateRecipeResult) {
    vi.mocked(hooks.generateRecipe).mockResolvedValue(
      JSON.stringify(generateRecipeResult)
    );
  }
};

describe("Recipe Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays loading state initially", () => {
    setupMocks({ search: "pasta" });

    render(<Recipe />);

    expect(screen.getByText("Loading recipe...")).toBeInTheDocument();
  });

  it("displays recipe from existing recipe data", async () => {
    setupMocks({ existingRecipe: mockRecipeData });

    render(<Recipe />);

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
      expect(screen.getByText("A test recipe description")).toBeInTheDocument();

      // Use regex for partial matches of ingredients
      expect(screen.getByText(/Ingredient 1/)).toBeInTheDocument();
      expect(screen.getByText(/Ingredient 2/)).toBeInTheDocument();

      // For instructions, the exact match should work
      expect(screen.getByText("Step 1 of the recipe")).toBeInTheDocument();
    });
  });

  it("fetches and displays recipe based on search term", async () => {
    setupMocks({
      search: "pasta",
      generateRecipeResult: mockRecipeData,
    });

    render(<Recipe />);

    expect(hooks.generateRecipe).toHaveBeenCalledWith("pasta", [
      "Onion",
      "Tomato",
    ]);

    await waitFor(() => {
      expect(screen.getByText("Test Recipe")).toBeInTheDocument();
      expect(screen.getByText("A test recipe description")).toBeInTheDocument();
    });
  });

  it("displays error message when recipe ID is provided", async () => {
    setupMocks({ id: "123" });

    render(<Recipe />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Recipe ID provided, but database lookup not yet implemented/
        )
      ).toBeInTheDocument();
    });
  });

  it("displays error when no search or ID is provided", async () => {
    setupMocks({});

    render(<Recipe />);

    await waitFor(() => {
      expect(
        screen.getByText(/No search term or recipe ID provided/)
      ).toBeInTheDocument();
    });
  });

  it("handles API errors properly", async () => {
    setupMocks({ search: "pasta" });

    const generateRecipe = vi.mocked(hooks.generateRecipe);
    generateRecipe.mockRejectedValue(new Error("API error"));

    render(<Recipe />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load recipe/)).toBeInTheDocument();
    });
  });

  it("renders ingredients list correctly", async () => {
    setupMocks({ existingRecipe: mockRecipeData });

    render(<Recipe />);

    await waitFor(() => {
      const ingredients = screen.getAllByRole("listitem");
      expect(ingredients.length).toBe(4); // 2 ingredients + 2 instructions
    });
  });

  it("renders instructions list correctly", async () => {
    setupMocks({ existingRecipe: mockRecipeData });

    const { container } = render(<Recipe />);

    await waitFor(() => {
      // First find the heading
      const instructionsHeading = screen.getByText("Instructions");
      // Then find the parent div
      const instructionsSection = instructionsHeading.closest("div");
      // Then find the list within that section
      const instructionsList = instructionsSection?.querySelector("ol");
      expect(instructionsList).toBeInTheDocument();

      // Check list items
      const listItems = instructionsList?.querySelectorAll("li");
      expect(listItems?.length).toBe(2);
    });
  });
});
