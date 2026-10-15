// Deployable public configuration. Never put a token, private key, or API secret here.
// HTTP API and auth remain disabled until server-side auth, RLS, budgets and HTTPS are verified.
export const siteConfig=Object.freeze({
  domain:'buiedu.com',
  mode:'preview',
  apiBaseUrl:'', // same-origin /v1/* after CloudFront routes to authenticated backend
  authProvider:'not-configured'
});
