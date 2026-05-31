import { Link } from "react-router-dom";
import { useAnalyticsConsent } from "../context/analyticsConsentContext";

const Footer = () => {
  const { consentStatus, isAnalyticsAvailable, openConsentSettings } =
    useAnalyticsConsent();

  return (
    <footer className="w-full bg-secondary border-t border-primary/20 mt-auto py-4 px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-between gap-3 text-text/60 text-sm md:flex-row">
        <span>
          © {new Date().getFullYear()} AI Kitchen. All rights reserved.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link to="/privacy" className="transition-colors hover:text-text">
            Privacy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-text">
            Terms
          </Link>
          <Link to="/blog" className="transition-colors hover:text-text">
            Blog
          </Link>
          <span className="text-text/45">Powered by Gemini AI</span>
          {isAnalyticsAvailable ? (
            <button
              type="button"
              onClick={openConsentSettings}
              className="rounded-full border border-primary/20 px-3 py-1 text-xs font-medium text-text/75 transition-colors hover:bg-background"
            >
              {consentStatus === "granted"
                ? "Analytics: on"
                : consentStatus === "denied"
                  ? "Analytics: off"
                  : "Privacy settings"}
            </button>
          ) : null}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
