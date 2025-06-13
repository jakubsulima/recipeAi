import axios from "axios";
import { API_URL, TIMEOUT } from "./const";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(`${import.meta.env.VITE_AI_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const formOfPrompt =
  " Answer in the following json format: name: The name of the recipe. description: A brief description of the recipe. timeToPrepare(string): just time to prepare. ingredients: An array of ingredient objects, where each object contains: name: The name of the ingredient. amount(double): The amount needed. unit(not null): The measurement unit (if applicable) only european units like litres. instructions: An array of step-by-step cooking instructions in complete sentences and withouut any special characters. ";
export const generateRecipe = async function (
  prompt: string,
  productsFridge: string[]
) {
  try {
    let result: any;
    if (productsFridge.length === 0) {
      result = await model.generateContent(prompt + formOfPrompt);
    } else {
      result = await model.generateContent(
        prompt +
          formOfPrompt +
          "It would be nice if you use some of this products for this recipe" +
          productsFridge.join(", ")
      );
    }

    return result.response.text();
  } catch (error: any) {
    console.error("AI Error:", error);
    const message = error.message || "Unknown AI error";
    const aiError = new Error(`AI Generation Error: ${message}`);
    // You could attach original error details if needed:
    // (aiError as any).originalError = error;
    throw aiError;
  }
};

export const AJAX = async function (
  url: string,
  uploadData: boolean = false,
  body: any = null
) {
  try {
    const fetchOperation = uploadData
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
    console.log(data);
    return data;
  } catch (error: any) {
    console.error(
      "AJAX Error Details:", // More specific console log
      error.response
        ? { status: error.response.status, data: error.response.data }
        : error.message
    );

    let finalError: Error;

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with an error status
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
        (finalError as any).status = status; // Attach status code
      } else if (error.request) {
        // Request was made but no response received
        finalError = new Error(
          "AJAX Error: No response from server. Check network or server availability."
        );
        (finalError as any).isNetworkError = true;
      } else {
        // Error setting up the request
        finalError = new Error(
          `AJAX Error: Request setup failed - ${error.message}`
        );
      }
    } else if (error instanceof Error) {
      // For other errors (e.g., timeout, custom HTML error from try block)
      finalError = error; // Preserve original error type and properties if it's already an Error instance
    } else {
      // Fallback for non-Error types thrown
      finalError = new Error(
        "An unknown AJAX error occurred: " + String(error)
      );
    }
    throw finalError;
  }
};
