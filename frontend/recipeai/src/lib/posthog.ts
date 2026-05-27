import posthog from "posthog-js";
import type { UserProps } from "../context/context";
import {
  getPostHogApiHost,
  getPostHogKey,
  getPostHogUiHost,
  isPostHogConfigured,
} from "./runtimeConfig";

export type AnalyticsEventName =
  | "$pageview"
  | "marketing_cta_click"
  | "auth_login_success"
  | "auth_signup_success"
  | "recipe_generation_requested"
  | "recipe_generation_succeeded"
  | "recipe_generation_failed"
  | "recipe_saved"
  | "shopping_list_generated"
  | "fridge_item_added"
  | "fridge_item_added_barcode"
  | "fridge_items_added_receipt";

type AnalyticsProperties = Record<string, unknown>;

let posthogInitialized = false;

const canCapture = (): boolean =>
  posthogInitialized && !posthog.has_opted_out_capturing();

export const initializePostHog = (): boolean => {
  if (!isPostHogConfigured()) {
    return false;
  }

  if (posthogInitialized) {
    posthog.opt_in_capturing();
    return true;
  }

  posthog.init(getPostHogKey(), {
    api_host: getPostHogApiHost(),
    ui_host: getPostHogUiHost(),
    defaults: "2026-01-30",
    autocapture: false,
    capture_pageview: false,
    persistence: "localStorage+cookie",
  });

  posthogInitialized = true;
  posthog.opt_in_capturing();
  return true;
};

export const disablePostHog = () => {
  if (!posthogInitialized) {
    return;
  }

  posthog.opt_out_capturing();
  posthog.reset();
};

export const captureEvent = (
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) => {
  if (!canCapture()) {
    return;
  }

  posthog.capture(eventName, {
    captureSource: "frontend",
    ...properties,
  });
};

export const capturePageView = () => {
  if (!canCapture()) {
    return;
  }

  captureEvent("$pageview", {
    $current_url: window.location.href,
    $pathname: window.location.pathname,
    $page_title: document.title,
  });
};

export const identifyAnalyticsUser = (user: UserProps) => {
  if (!canCapture()) {
    return;
  }

  posthog.identify(String(user.id), {
    email: user.email,
    role: user.role,
    subscriptionPlan: user.subscriptionPlan ?? "FREE",
  });
};

export const resetAnalyticsUser = () => {
  if (!posthogInitialized) {
    return;
  }

  posthog.reset();
};
