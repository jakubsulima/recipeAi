import axios from "axios";
import { API_URL, TIMEOUT } from "./constants.tsx";

const formOfPrompt =
  " Act as a professional culinary database architect and recommendation engine. Return ONLY a single valid JSON object following this exact schema: { \"name\": string, \"description\": string, \"timeToPrepare\": string, \"ingredients\": [{\"name\": string, \"amount\": number, \"unit\": string}], \"instructions\": [string], \"nutrition\": { \"calories\": number, \"protein\": number, \"carbs\": number, \"fats\": number } }. Enforce user filters from the request text (meal type, cuisine, time constraint, and additional notes). Include 8-14 ingredients with realistic amounts for 2 servings. Use strict metric units (g, ml, kg) or whole counts. Provide 6-9 technical instructions with sensory cues and clear time/temperature markers. Avoid vague steps like 'cook until done'. Ensure nutrition values are internally consistent with the listed ingredients. Do not include markdown or conversational text.";
const batchFormOfPrompt =
  " Act as a professional culinary database architect and recommendation engine. Return ONLY a single valid JSON object following this exact schema: { \"recipes\": [{ \"name\": string, \"description\": string, \"timeToPrepare\": string, \"ingredients\": [{\"name\": string, \"amount\": number, \"unit\": string}], \"instructions\": [string], \"nutrition\": { \"calories\": number, \"protein\": number, \"carbs\": number, \"fats\": number } }] }. Enforce user filters from the request text (meal type, cuisine, time constraint, and additional notes). All generated recipes must match those filters. Create meaningful diversity across recipes by varying core protein category, cooking technique, and flavor profile while staying plausible. For EACH recipe: include 8-14 ingredients with realistic amounts for 2 servings, use strict metric units (g, ml, kg) or whole counts, and provide 6-9 technical instructions with sensory cues and clear time/temperature markers. Ensure nutrition values are internally consistent with the listed ingredients. Do not include markdown or conversational text.";

const inFlightRecipeRequests = new Map<string, Promise<any>>();

const buildRecipePrompt = (
  prompt: string,
  productsFridge: string[],
  requestedCount: number
) => {
  const promptFormat = requestedCount > 1 ? batchFormOfPrompt : formOfPrompt;
  const countInstruction =
    requestedCount > 1
      ? ` Return exactly ${requestedCount} recipes in the recipes array.`
      : " Return exactly 1 recipe object.";
  return (
    prompt +
    promptFormat +
    countInstruction +
    (productsFridge.length > 0
      ? " Prioritize using these products for this recipe: " +
        productsFridge.join(", ")
      : "")
  );
};

const requestRecipeGeneration = async (
  prompt: string,
  productsFridge: string[],
  requestedCount: number,
  signal?: AbortSignal
) => {
  const fullPrompt = buildRecipePrompt(prompt, productsFridge, requestedCount);
  const result = await axios.post(
    `${API_URL}generateRecipe`,
    {
      fullPrompt,
      count: requestedCount,
    },
    { signal }
  );

  return result.data;
};

const buildGenerationKey = (
  prompt: string,
  productsFridge: string[],
  requestedCount: number
) => `${requestedCount}::${prompt}::${productsFridge.join("|")}`;

export const generateRecipe = async function (
  prompt: string,
  productsFridge: string[],
  signal?: AbortSignal,
  count: number = 1
) {
  try {
    const normalizedCount = Math.max(1, Math.min(5, Math.floor(count)));

    // Requests controlled by AbortController should never share promises,
    // otherwise a previously aborted request can cancel a fresh one.
    if (signal) {
      return await requestRecipeGeneration(
        prompt,
        productsFridge,
        normalizedCount,
        signal
      );
    }

    const requestKey = buildGenerationKey(prompt, productsFridge, normalizedCount);

    if (!inFlightRecipeRequests.has(requestKey)) {
      const requestPromise = requestRecipeGeneration(
        prompt,
        productsFridge,
        normalizedCount,
        signal
      ).finally(() => {
        inFlightRecipeRequests.delete(requestKey);
      });

      inFlightRecipeRequests.set(requestKey, requestPromise);
    }

    return await inFlightRecipeRequests.get(requestKey)!;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      throw new DOMException("Recipe generation cancelled", "AbortError");
    }

    const message = axios.isAxiosError(error)
      ? typeof error.response?.data === "string" && error.response.data.trim() !== ""
        ? error.response.data
        : typeof error.response?.data?.message === "string" &&
          error.response.data.message.trim() !== ""
        ? error.response.data.message
        : error.message
      : error?.message || "Unknown AI error";
    throw new Error(`AI Generation Error: ${message}`);
  }
};

export const cleanAiJsonString = (response: any): string => {
  let jsonString =
    typeof response === "string"
      ? response.replace(/```json|```/g, "").trim()
      : JSON.stringify(response);
  jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");
  jsonString = jsonString.replace(/"timeToPrepare\(string\)"/g, '"timeToPrepare"');
  return jsonString;
};

export const lookupProductByBarcode = async (
  barcode: string
): Promise<string | null> => {
  const normalized = barcode.trim();
  if (!normalized) {
    return null;
  }

  const response = await axios.get(
    `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(
      normalized
    )}.json`,
    {
      withCredentials: false,
    }
  );

  const product = response.data?.product;
  const name =
    product?.product_name?.trim() ||
    product?.product_name_en?.trim() ||
    product?.generic_name?.trim() ||
    null;

  return name;
};

axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.withCredentials = true;

let refreshTokenRequest: Promise<void> | null = null;

const refreshAccessToken = async () => {
  if (!refreshTokenRequest) {
    refreshTokenRequest = axios
      .post(`${API_URL}refresh`, null, { withCredentials: true })
      .then(() => undefined)
      .finally(() => {
        refreshTokenRequest = null;
      });
  }

  return refreshTokenRequest;
};

// Add axios interceptor to handle token refresh automatically
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = String(originalRequest?.url ?? "");
    const isRefreshRequest = requestUrl.includes("/refresh");
    const shouldAttemptTokenRefresh =
      localStorage.getItem("isLoggedIn") === "true";

    // If error is 401 and we haven't retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      shouldAttemptTokenRefresh
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();

        // Retry the original request with new token
        return axios(originalRequest);
      } catch (refreshError: any) {
        localStorage.removeItem("isLoggedIn");
        window.dispatchEvent(new Event("auth:session-expired"));
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
  const normalizedUrl = String(url ?? "");
  const authNoiseEndpoints = [
    "me",
    "refresh",
    "getFridgeIngredients",
    "shoppingList",
  ];
  const isAuthNoiseEndpoint = authNoiseEndpoints.some((endpoint) =>
    normalizedUrl.includes(endpoint)
  );

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
      if (isAuthNoiseEndpoint) {
        (htmlError as any).status = 401;
      }
      throw htmlError;
    }

    const data = await res.data;
    return data;
  } catch (error: any) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : typeof error?.status === "number"
      ? error.status
      : undefined;
    const isExpectedAuthNoise =
      ((status === 401 || status === 400) && isAuthNoiseEndpoint) ||
      (Boolean(error?.isContentTypeError) && isAuthNoiseEndpoint);

    if (!isExpectedAuthNoise) {
      console.error(
        "AJAX Error Details:",
        error.response
          ? { status: error.response.status, data: error.response.data }
          : error.message
      );
    }

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

export const deleteClient = async function (url: string) {
  try {
    const res = await axios.delete(API_URL + url);
    return res.data;
  } catch (error: any) {
    console.error(
      "Delete Error:",
      error.response
        ? { status: error.response.status, data: error.response.data }
        : error.message
    );
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const message =
        typeof error.response.data?.message === "string"
          ? error.response.data.message
          : `Server error with status ${status}`;
      const finalError = new Error(`AJAX Error (${status}): ${message}`);
      (finalError as any).status = status;
      throw finalError;
    }
    throw new Error(error.message || "Unknown delete error");
  }
};

export const putClient = async function (url: string, body: any = null) {
  try {
    const res = await axios.put(API_URL + url, body, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error: any) {
    console.error(
      "Put Error:",
      error.response
        ? { status: error.response.status, data: error.response.data }
        : error.message
    );
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const message =
        typeof error.response.data?.message === "string"
          ? error.response.data.message
          : `Server error with status ${status}`;
      const finalError = new Error(`AJAX Error (${status}): ${message}`);
      (finalError as any).status = status;
      throw finalError;
    }
    throw new Error(error.message || "Unknown put error");
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
