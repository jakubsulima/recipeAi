import axios from "axios";
import { API_URL, TIMEOUT } from "./constants";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_AI_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
const formOfPrompt =
  " Answer in the following json format: name: The name of the recipe. description: A brief description of the recipe. timeToPrepare(string): just time to prepare. ingredients: An array of ingredient objects, where each object contains: name: The name of the ingredient. amount(double): The amount needed. unit(not null): The measurement unit (if applicable) only european units like litres. instructions: An array of step-by-step cooking instructions in complete sentences and withouut any special characters. ";
export const generateRecipe = async function (
  prompt: string,
  productsFridge: string[]
) {
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let result: any;
      const fullPrompt =
        prompt +
        formOfPrompt +
        (productsFridge.length > 0
          ? "It would be nice if you use some of this products for this recipe" +
            productsFridge.join(", ")
          : "");

      result = await model.generateContent(fullPrompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;
      console.error(`AI Error (Attempt ${attempt}/${maxRetries}):`, error);

      if (
        error.message &&
        error.message.includes("503") &&
        attempt < maxRetries
      ) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(
          `Model is overloaded. Retrying in ${delay / 1000} second(s)...`
        );
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      const message = error.message || "Unknown AI error";
      const aiError = new Error(`AI Generation Error: ${message}`);
      throw aiError;
    }
  }

  const message =
    lastError.message || "Unknown AI error after multiple retries";
  const aiError = new Error(`AI Generation Error: ${message}`);
  throw aiError;
};

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

export const apiClient = async function (
  url: string,
  uploadData: boolean = false,
  body: any = null
) {
  try {
    const fetchOperation = uploadData
      ? axios.post(API_URL + url, body)
      : axios.get(API_URL + url, {
          timeout: TIMEOUT * 1000,
        });

    const res: any = await Promise.race([
      fetchOperation,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timed out after ${TIMEOUT} seconds`)),
          TIMEOUT * 1000
        )
      ),
    ]);
    const contentType = res.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      const htmlError = new Error(
        "Received HTML instead of JSON. Backend endpoint may be incorrect or down."
      );
      (htmlError as any).isContentTypeError = true;
      throw htmlError;
    }

    const data = await res.data;
    return data;
  } catch (error: any) {
    console.error(
      "AJAX Error Details:",
      error.response
        ? { status: error.response.status, data: error.response.data }
        : error.message
    );

    let finalError: Error;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        let message = `Server error with status ${status}`;
        if (
          error.response.data &&
          typeof error.response.data.message === "string" &&
          error.response.data.message.trim() !== ""
        ) {
          message = error.response.data.message;
        } else if (
          typeof error.response.data === "string" &&
          error.response.data.trim() !== ""
        ) {
          message = error.response.data;
        }
        finalError = new Error(`AJAX Error (${status}): ${message}`);
        (finalError as any).status = status;
      } else if (error.request) {
        finalError = new Error(
          "AJAX Error: No response from server. Check network or server availability."
        );
        (finalError as any).isNetworkError = true;
      } else {
        finalError = new Error(
          `AJAX Error: Request setup failed - ${error.message}`
        );
      }
    } else if (error instanceof Error) {
      finalError = error;
    } else {
      finalError = new Error(
        "An unknown AJAX error occurred: " + String(error)
      );
    }
    throw finalError;
  }
};
