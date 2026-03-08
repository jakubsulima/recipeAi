import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateRecipe } from "../src/lib/hooks";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from the project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
