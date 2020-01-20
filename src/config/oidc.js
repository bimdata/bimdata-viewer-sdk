const authority = process.env.VUE_APP_BIMDATA_OIDC_URL || 'https://iam.bimdata.io/auth/realms/bimdata';


const clientId = process.env.VUE_APP_CLIENT_ID

if (!clientId) {
    throw new Error('You must define a CLIENT_ID. Have you generated your .env file as explained in the README.md?')
}
export const oidcSettings = {
    redirectUri: 'http://localhost:8080/oidc-callback',
    authority,
    clientId,
    responseType: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
    validateSubOnSilentRenew: true,
    extraQueryParams: { kc_idp_hint: 'bimdataconnect' },
    monitorSession: false,
}
