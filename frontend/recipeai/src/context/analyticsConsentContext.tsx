import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { disablePostHog, initializePostHog } from "../lib/posthog";
import { isPostHogConfigured } from "../lib/runtimeConfig";

/* eslint-disable react-refresh/only-export-components */

type AnalyticsConsentStatus = "granted" | "denied" | "unset";

interface AnalyticsConsentContextValue {
  isAnalyticsAvailable: boolean;
  consentStatus: AnalyticsConsentStatus;
  grantConsent: () => void;
  denyConsent: () => void;
  openConsentSettings: () => void;
  closeConsentSettings: () => void;
  isConsentSettingsOpen: boolean;
}

const ANALYTICS_CONSENT_STORAGE_KEY = "dishgenie.analytics.consent";

const readStoredConsent = (): AnalyticsConsentStatus => {
  const storedValue = localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);

  if (storedValue === "granted" || storedValue === "denied") {
    return storedValue;
  }

  return "unset";
};

const persistConsent = (consentStatus: Exclude<AnalyticsConsentStatus, "unset">) => {
  localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consentStatus);
};

const defaultValue: AnalyticsConsentContextValue = {
  isAnalyticsAvailable: false,
  consentStatus: "unset",
  grantConsent: () => {
    // no-op default
  },
  denyConsent: () => {
    // no-op default
  },
  openConsentSettings: () => {
    // no-op default
  },
  closeConsentSettings: () => {
    // no-op default
  },
  isConsentSettingsOpen: false,
};

const AnalyticsConsentContext =
  createContext<AnalyticsConsentContextValue>(defaultValue);

export const useAnalyticsConsent = () => useContext(AnalyticsConsentContext);

export const AnalyticsConsentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAnalyticsAvailable = isPostHogConfigured();
  const [consentStatus, setConsentStatus] =
    useState<AnalyticsConsentStatus>("unset");
  const [isConsentSettingsOpen, setIsConsentSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isAnalyticsAvailable) {
      disablePostHog();
      return;
    }

    const storedConsent = readStoredConsent();
    setConsentStatus(storedConsent);

    if (storedConsent === "granted") {
      initializePostHog();
    } else {
      disablePostHog();
    }
  }, [isAnalyticsAvailable]);

  const grantConsent = useCallback(() => {
    if (!isAnalyticsAvailable) {
      return;
    }

    persistConsent("granted");
    setConsentStatus("granted");
    initializePostHog();
    setIsConsentSettingsOpen(false);
  }, [isAnalyticsAvailable]);

  const denyConsent = useCallback(() => {
    if (!isAnalyticsAvailable) {
      return;
    }

    persistConsent("denied");
    setConsentStatus("denied");
    disablePostHog();
    setIsConsentSettingsOpen(false);
  }, [isAnalyticsAvailable]);

  const openConsentSettings = useCallback(() => {
    if (!isAnalyticsAvailable) {
      return;
    }

    setIsConsentSettingsOpen(true);
  }, [isAnalyticsAvailable]);

  const closeConsentSettings = useCallback(() => {
    setIsConsentSettingsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isAnalyticsAvailable,
      consentStatus,
      grantConsent,
      denyConsent,
      openConsentSettings,
      closeConsentSettings,
      isConsentSettingsOpen,
    }),
    [
      closeConsentSettings,
      consentStatus,
      denyConsent,
      grantConsent,
      isAnalyticsAvailable,
      isConsentSettingsOpen,
      openConsentSettings,
    ],
  );

  return (
    <AnalyticsConsentContext.Provider value={value}>
      {children}
    </AnalyticsConsentContext.Provider>
  );
};
