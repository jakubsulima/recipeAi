export type GoogleCredentialResponse = {
  credential: string;
  select_by?: string;
};

type GoogleCallback = (response: GoogleCredentialResponse) => void;

interface GsiState {
  initialized: boolean;
  clientId: string;
  callback: GoogleCallback | null;
}

interface RecipeAiWindow extends Window {
  __recipeAiGsiState?: GsiState;
  __recipeAiGsiScriptPromise?: Promise<void>;
}

const GOOGLE_IDENTITY_SCRIPT_URL = "https://accounts.google.com/gsi/client";

export const getGsiState = (): GsiState => {
  const globalWindow = window as RecipeAiWindow;
  if (!globalWindow.__recipeAiGsiState) {
    globalWindow.__recipeAiGsiState = {
      initialized: false,
      clientId: "",
      callback: null,
    };
  }
  return globalWindow.__recipeAiGsiState;
};

export const loadGoogleIdentityScript = (): Promise<void> => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const globalWindow = window as RecipeAiWindow;
  if (globalWindow.__recipeAiGsiScriptPromise) {
    return globalWindow.__recipeAiGsiScriptPromise;
  }

  globalWindow.__recipeAiGsiScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      globalWindow.__recipeAiGsiScriptPromise = undefined;
      reject(new Error("Failed to load Google Identity Services"));
    };

    document.head.appendChild(script);
  });

  return globalWindow.__recipeAiGsiScriptPromise;
};
