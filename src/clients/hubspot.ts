import { Client } from "@hubspot/api-client";
import config from "../config";
import dao from "../data/dao";

const developerClient = new Client({
  developerApiKey: config.env.HUBSPOT_DEVELOPER_API_KEY,
});

async function exchangeAuthCodeForToken(
  code: string,
  redirectUrl: string,
): Promise<string> {
  const tokensInfo = await developerClient.oauth.tokensApi.create(
    "authorization_code",
    code,
    redirectUrl,
    config.env.HUBSPOT_CLIENT_ID,
    config.env.HUBSPOT_CLIENT_SECRET,
  );
  const { hubId } = await developerClient.oauth.accessTokensApi.get(
    tokensInfo.accessToken,
  );
  const record = await dao.upsertOauthToken(hubId, tokensInfo);
  return record.accessToken;
}

async function getOrRefreshAccessToken(hubId: number): Promise<string> {
  let record = await dao.getOauthTokenOrThrow(hubId);
  if (record.isAccessTokenValid()) {
    return record.accessToken;
  }

  let tokensInfo;
  try {
    console.log("Refreshing access token for hub:", hubId);
    tokensInfo = await developerClient.oauth.tokensApi.create(
      "refresh_token",
      undefined,
      undefined,
      config.env.HUBSPOT_CLIENT_ID,
      config.env.HUBSPOT_CLIENT_SECRET,
      record.refreshToken,
    );
  } catch (err) {
    throw new Error(`Cannot refresh token: ${err}`);
  }
  record = await dao.upsertOauthToken(hubId, tokensInfo);
  return record.accessToken;
}

async function getApiClient(hubId: number): Promise<Client> {
  const accessToken = await getOrRefreshAccessToken(hubId);
  return new Client({
    accessToken,
  });
}

export default {
  exchangeAuthCodeForToken,
  getOrRefreshAccessToken,
  getApiClient,
};
