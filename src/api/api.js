import { makeBIMDataApiClient } from "@bimdata/typescript-fetch-api-client";

export default function getClient({ accessToken, apiUrl }) {
  const apiClient = makeBIMDataApiClient({
    apiUrl: apiUrl,
    credentials: "include"
  });
  apiClient.accessToken = accessToken
  return apiClient;
}
