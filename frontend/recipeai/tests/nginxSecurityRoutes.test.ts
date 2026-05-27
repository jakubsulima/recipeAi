import { readFileSync } from "node:fs";
import path from "node:path";

const frontendRoot = path.resolve(import.meta.dirname, "..");

const readConfig = (relativePath: string) =>
  readFileSync(path.join(frontendRoot, relativePath), "utf8");

const spaFallbackLine = "try_files $uri $uri/ /index.html;";

const getBlockedPathPattern = (config: string) => {
  const match = config.match(/location ~\* ([^ ]+) \{\s*return 404;/);

  if (!match) {
    throw new Error("Blocked path location not found in nginx config");
  }

  return match[1];
};

describe("nginx sensitive path protection", () => {
  const templateConfig = readConfig("nginx.conf.template");
  const sslConfig = readConfig("nginx-ssl.conf");
  const blockedPattern = getBlockedPathPattern(templateConfig);
  const blockedPathRegex = new RegExp(blockedPattern, "i");
  const blockedLocationLine = `location ~* ${blockedPattern} {`;
  const reachesSpaFallback = (requestPath: string) =>
    templateConfig.includes(spaFallbackLine) && !blockedPathRegex.test(requestPath);

  it("keeps the same blocked path rule in both nginx configs", () => {
    expect(getBlockedPathPattern(sslConfig)).toBe(blockedPattern);
  });

  it("places the blocked path rule before the SPA fallback", () => {
    expect(templateConfig.indexOf(blockedLocationLine)).toBeGreaterThan(-1);
    expect(templateConfig.indexOf(blockedLocationLine)).toBeLessThan(
      templateConfig.indexOf(spaFallbackLine),
    );
    expect(templateConfig).toContain(spaFallbackLine);
  });

  it("matches secret and probe paths that must not reach the SPA fallback", () => {
    expect(blockedPathRegex.test("/server/.env")).toBe(true);
    expect(blockedPathRegex.test("/stripe.env")).toBe(true);
    expect(blockedPathRegex.test("/terraform.tfstate")).toBe(true);
    expect(blockedPathRegex.test("/terraform.tfstate.backup")).toBe(true);
    expect(blockedPathRegex.test("/terraform.tfvars")).toBe(true);
    expect(blockedPathRegex.test("/serverless.yml")).toBe(true);
    expect(blockedPathRegex.test("/serverless.yaml")).toBe(true);
    expect(blockedPathRegex.test("/vercel.json")).toBe(true);
    expect(blockedPathRegex.test("/netlify.toml")).toBe(true);
    expect(blockedPathRegex.test("/docker-compose.yml")).toBe(true);
    expect(blockedPathRegex.test("/docker-compose.yaml")).toBe(true);
    expect(blockedPathRegex.test("/amplify.yml")).toBe(true);
    expect(blockedPathRegex.test("/amplify.yaml")).toBe(true);
    expect(blockedPathRegex.test("/dump.sql")).toBe(true);
    expect(blockedPathRegex.test("/archive.bak")).toBe(true);
    expect(blockedPathRegex.test("/wp-content/debug.log")).toBe(true);
    expect(blockedPathRegex.test("/blog/wp-content/debug.log")).toBe(true);
    expect(blockedPathRegex.test("/wp-json/users")).toBe(true);
    expect(blockedPathRegex.test("/blog/wp-json/users")).toBe(true);
    expect(blockedPathRegex.test("/wp-config.php")).toBe(true);
    expect(blockedPathRegex.test("/xmlrpc.php")).toBe(true);
    expect(blockedPathRegex.test("/webhooks/incoming/stripe.json")).toBe(true);
    expect(blockedPathRegex.test("/stripe-keys.json")).toBe(true);
    expect(blockedPathRegex.test("/stripe-credentials.json")).toBe(true);
    expect(blockedPathRegex.test("/sendgrid.env")).toBe(true);
  });

  it("keeps root and normal app routes eligible for the SPA fallback", () => {
    expect(reachesSpaFallback("/")).toBe(true);
    expect(reachesSpaFallback("/Recipes")).toBe(true);
    expect(reachesSpaFallback("/Fridge")).toBe(true);
    expect(reachesSpaFallback("/recipes/123")).toBe(true);
    expect(reachesSpaFallback("/server/.env")).toBe(false);
    expect(reachesSpaFallback("/stripe.env")).toBe(false);
    expect(reachesSpaFallback("/terraform.tfstate")).toBe(false);
    expect(reachesSpaFallback("/serverless.yml")).toBe(false);
    expect(reachesSpaFallback("/wp-content/debug.log")).toBe(false);
  });
});
