interface RecipeAiRuntimeConfig {
  googleClientId?: string;
  posthogEnabled?: boolean | string;
  posthogKey?: string;
  posthogApiHost?: string;
  posthogUiHost?: string;
}

interface RecipeAiWindow extends Window {
  __RECIPE_AI_RUNTIME_CONFIG__?: RecipeAiRuntimeConfig;
}

const getRuntimeConfig = (): RecipeAiRuntimeConfig => {
  const globalWindow = window as RecipeAiWindow;
  return globalWindow.__RECIPE_AI_RUNTIME_CONFIG__ ?? {};
};

const readString = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

const readBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "true") {
      return true;
    }
    if (normalizedValue === "false") {
      return false;
    }
  }

  return undefined;
};

const getRuntimeOrBuildString = (
  runtimeValue: unknown,
  buildTimeValue?: string,
): string => readString(runtimeValue) || buildTimeValue || "";

export const getGoogleClientId = (): string =>
  getRuntimeOrBuildString(
    getRuntimeConfig().googleClientId,
    import.meta.env.VITE_GOOGLE_CLIENT_ID,
  );

const isPostHogEnabled = (): boolean =>
  readBoolean(getRuntimeConfig().posthogEnabled) ??
  readBoolean(import.meta.env.VITE_POSTHOG_ENABLED) ??
  false;

export const getPostHogKey = (): string =>
  getRuntimeOrBuildString(
    getRuntimeConfig().posthogKey,
    import.meta.env.VITE_POSTHOG_KEY,
  );

export const getPostHogApiHost = (): string =>
  getRuntimeOrBuildString(
    getRuntimeConfig().posthogApiHost,
    import.meta.env.VITE_POSTHOG_API_HOST,
  );

export const getPostHogUiHost = (): string =>
  getRuntimeOrBuildString(
    getRuntimeConfig().posthogUiHost,
    import.meta.env.VITE_POSTHOG_UI_HOST,
  );

export const isPostHogConfigured = (): boolean =>
  isPostHogEnabled() &&
  getPostHogKey() !== "" &&
  getPostHogApiHost() !== "" &&
  getPostHogUiHost() !== "";
