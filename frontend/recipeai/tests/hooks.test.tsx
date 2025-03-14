import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateRecipe } from "../src/lib/hooks";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "/Users/jakub/Desktop/recipeai/frontend/recipeai/.env" });

describe("AJAX function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return answer from AI", async () => {
    const result = await generateRecipe("test prompt", ["Onion", "Tomato"]);

    console.log("Result from AI:", result); // Debugging log

    expect(result).toBeDefined(); // Example check if result has 'candidates'
  });
});
