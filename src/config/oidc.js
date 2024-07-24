const authority =
  import.meta.env.VITE_APP_BIMDATA_OIDC_URL ||
  "https://iam.bimdata.io/auth/realms/bimdata";

const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:8081";

const clientId =
  import.meta.env.VITE_APP_CLIENT_ID || "6dd2bdd5-54df-49c5-9bea-43fe68e0cc13";

if (!clientId) {
  throw new Error(
    "You must define a CLIENT_ID. Have you generated your .env file as explained in the README.md?"
  );
}
export const oidcSettings = {
  redirectUri: appUrl + "/oidc-callback",
  authority,
  clientId,
  responseType: "code",
  scope: "openid profile email",
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
  extraQueryParams: { kc_idp_hint: "bimdataconnect" },
  monitorSession: false,
};
