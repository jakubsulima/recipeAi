import { useEffect } from "react";
import { useUser } from "../context/context";
import { useAnalyticsConsent } from "../context/analyticsConsentContext";
import { identifyAnalyticsUser, resetAnalyticsUser } from "../lib/posthog";

const AnalyticsIdentitySync = () => {
  const { user, loading } = useUser();
  const { consentStatus } = useAnalyticsConsent();

  useEffect(() => {
    if (loading || consentStatus !== "granted") {
      return;
    }

    if (user) {
      identifyAnalyticsUser(user);
      return;
    }

    resetAnalyticsUser();
  }, [consentStatus, loading, user]);

  return null;
};

export default AnalyticsIdentitySync;
