import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import AnalyticsConsentBanner from "../src/components/AnalyticsConsentBanner";
import {
  AnalyticsConsentProvider,
  useAnalyticsConsent,
} from "../src/context/analyticsConsentContext";

const posthogMocks = vi.hoisted(() => ({
  init: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
}));

vi.mock("posthog-js", () => ({
  default: posthogMocks,
}));

const ConsentSettingsButton = () => {
  const { openConsentSettings } = useAnalyticsConsent();

  return (
    <button type="button" onClick={openConsentSettings}>
      Open privacy settings
    </button>
  );
};

describe("AnalyticsConsentBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      window as Window & {
        __RECIPE_AI_RUNTIME_CONFIG__?: unknown;
      }
    ).__RECIPE_AI_RUNTIME_CONFIG__ = {
      posthogEnabled: true,
      posthogKey: "project-key",
      posthogApiHost: "https://metrics.dishgenie.app",
      posthogUiHost: "https://eu.posthog.com",
    };
  });

  test("accepting analytics stores granted consent and initializes PostHog", async () => {
    render(
      <AnalyticsConsentProvider>
        <AnalyticsConsentBanner />
      </AnalyticsConsentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));

    await waitFor(() => {
      expect(localStorage.getItem("dishgenie.analytics.consent")).toBe(
        "granted",
      );
      expect(posthogMocks.init).toHaveBeenCalledWith(
        "project-key",
        expect.objectContaining({
          api_host: "https://metrics.dishgenie.app",
          ui_host: "https://eu.posthog.com",
          capture_pageview: false,
        }),
      );
      expect(posthogMocks.opt_in_capturing).toHaveBeenCalled();
    });
  });

  test("rejecting analytics stores denied consent and keeps banner reopenable", async () => {
    render(
      <AnalyticsConsentProvider>
        <ConsentSettingsButton />
        <AnalyticsConsentBanner />
      </AnalyticsConsentProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reject analytics" }));

    await waitFor(() => {
      expect(localStorage.getItem("dishgenie.analytics.consent")).toBe(
        "denied",
      );
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Open privacy settings" }),
    );

    expect(
      screen.getByRole("button", { name: "Accept analytics" }),
    ).toBeInTheDocument();
  });

  test("disabled analytics hides the banner and does not initialize PostHog", () => {
    (
      window as Window & {
        __RECIPE_AI_RUNTIME_CONFIG__?: unknown;
      }
    ).__RECIPE_AI_RUNTIME_CONFIG__ = {
      posthogEnabled: false,
      posthogKey: "project-key",
      posthogApiHost: "https://metrics.dishgenie.app",
      posthogUiHost: "https://eu.posthog.com",
    };

    render(
      <AnalyticsConsentProvider>
        <AnalyticsConsentBanner />
      </AnalyticsConsentProvider>,
    );

    expect(
      screen.queryByRole("button", { name: "Accept analytics" }),
    ).not.toBeInTheDocument();
    expect(posthogMocks.init).not.toHaveBeenCalled();
  });
});
