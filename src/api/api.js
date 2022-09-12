import { makeBIMDataApiClient } from "@bimdata/typescript-fetch-api-client";

makeBIMDataApiClient({
  apiUrl: process.env.VUE_APP_API_BASE_URL,
  credentials: "include"
});

export default function getClient({ accessToken, apiUrl }) {
  const apiClient = makeBIMDataApiClient({
    apiUrl: apiUrl,
    credentials: "include"
  });
  apiClient.accessToken = accessToken
  return apiClient;
}
