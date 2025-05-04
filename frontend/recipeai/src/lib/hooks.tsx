import axios from "axios";
import { API_URL, TIMEOUT } from "./const";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_AI_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const formOfPrompt =
  " Answer in the following json format: recipe_name: The name of the recipe. description: A brief description of the recipe. ingredients: An array of ingredient objects, where each object contains: item: The name of the ingredient. quantity: The amount needed. unit: The measurement unit (if applicable). instructions: An array of step-by-step cooking instructions in complete sentences and withouut any special characters. ";
export const generateRecipe = async function (
  prompt: string,
  productsFridge: string[]
) {
  try {
    const result = await model.generateContent(
      prompt +
        formOfPrompt +
        "It would be nice if you use some of this products for this recipe" +
        productsFridge.join(", ")
    );
    return result.response.text();
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error("AI Error: " + error.message);
  }
};

export const AJAX = async function (
  url: string,
  uploadData: boolean = false,
  body: any = null
) {
  try {
    const fetch = uploadData
      ? axios.post(API_URL + url, body, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
      : axios.get(API_URL + url, {
          timeout: TIMEOUT * 1000,
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });

    const res: any = await Promise.race([
      fetch,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Request timed out!")),
          TIMEOUT * 1000
        )
      ),
    ]);
    const contentType = res.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        "Received HTML instead of JSON. Backend endpoint may be incorrect."
      );
    }

    const data = await res.data;
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(
      "AJAX Error:",
      error.response ? error.response.data : error.message
    );

    throw new Error(
      error.response
        ? `AJAX Error: ${error.response.status} - ${error.response.data.message}`
        : error.message
    );
  }
};
