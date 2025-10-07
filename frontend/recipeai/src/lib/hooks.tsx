import axios from "axios";
import { API_URL, TIMEOUT } from "./constants.tsx";

const formOfPrompt =
  " Answer in the following json format: name: The name of the recipe. description: A brief description of the recipe. timeToPrepare(string): just time to prepare. ingredients: An array of ingredient objects, where each object contains: name: The name of the ingredient. amount(double): The amount needed. unit(not null): The measurement unit (if applicable) only european units like litres. instructions: An array of step-by-step cooking instructions in complete sentences and withouut any special characters. ";
export const generateRecipe = async function (
  prompt: string,
  productsFridge: string[]
) {
  try {
    const fullPrompt =
      prompt +
      formOfPrompt +
      (productsFridge.length > 0
        ? "It would be nice if you use some of this products for this recipe" +
          productsFridge.join(", ")
        : "");

    const result = await axios.post(`${API_URL}generateRecipe`, {
      fullPrompt,
    });
    return result.data;
  } catch (error: any) {
    const message = error.message || "Unknown AI error";
    throw new Error(`AI Generation Error: ${message}`);
  }
};

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

// Add axios interceptor to handle token refresh automatically
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.post(API_URL + "refresh");

        // Retry the original request with new token
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const apiClient = async function (
  url: string,
  uploadData: boolean = false,
  body: any = null
) {
  try {
    const isPlainString = typeof body === "string";
    const fetchOperation = uploadData
      ? axios.post(API_URL + url, body, {
          headers: isPlainString
            ? { "Content-Type": "text/plain" }
            : { "Content-Type": "application/json" },
        })
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

export const formatDateForBackend = (dateString: string): string => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const isValidNumber = (value: string): boolean => {
  if (value.trim() === "") return false;

  const numberRegex = /^[0-9]*\.?[0-9]+$/;

  if (!numberRegex.test(value.trim())) return false;

  const num = parseFloat(value.trim());
  return !isNaN(num) && num > 0;
};

export const hasAmountError = (amount: string): boolean => {
  return amount.trim() !== "" && !isValidNumber(amount);
};
