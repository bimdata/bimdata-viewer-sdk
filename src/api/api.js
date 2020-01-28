import * as bimdata from '@bimdata/bimdata-api-client'

export default function getClient({ accessToken, apiUrl }) {
  const defaultClient = bimdata.ApiClient.instance;
  defaultClient.basePath = apiUrl;
  const Bearer = defaultClient.authentications["Bearer"];

  Bearer.type = "oauth2";
  Bearer.accessToken = accessToken;

  return bimdata;
}
