import type { Express } from "express";
import type { TokenResponseIF } from "@hubspot/api-client/lib/codegen/oauth";
import express from "express";
import { Client } from "@hubspot/api-client";
import { OauthToken } from "../models";
import { normalizePath, removeTrailingSlash } from "../utils";
import config from "../config";

export const useOauth = (app: Express, path: string) => {
  const basePath = normalizePath(path);
  app.use(basePath, OauthController(basePath));
};

const OauthController = (basePath: string) => {
  const router = express.Router();

  const installPath = "/install";
  const callbackPath = "/hubspot/callback";

  // request to install the app by initiating OAuth access
  router.get(installPath, async (req, res) => {
    const redirectUrl = getRedirectUrl(basePath, callbackPath);
    const authorizeUrl = getAuthorizeUrl(redirectUrl);

    console.log("Initiating OAuth access:", authorizeUrl);
    res.redirect(authorizeUrl); // redirect the user to the HubSpot to give permission
  });

  // accept callback from HubSpot to complete the OAuth handshake
  router.get(callbackPath, async (req, res) => {
    const CLIENT_ID = config.env.HUBSPOT_CLIENT_ID;
    const CLIENT_SECRET = config.env.HUBSPOT_CLIENT_SECRET;
    const DEVELOPER_API_KEY = config.env.HUBSPOT_DEVELOPER_API_KEY;

    const code = req.query?.code as string | undefined;
    console.log("Retrieving access token by code:", code);
    const hubspotClient = new Client({ developerApiKey: DEVELOPER_API_KEY });
    const tokensInfo = await hubspotClient.oauth.tokensApi.create(
      "authorization_code",
      code,
      getRedirectUrl(basePath, callbackPath),
      CLIENT_ID,
      CLIENT_SECRET,
    );
    const { hubId } = await hubspotClient.oauth.accessTokensApi.get(
      tokensInfo.accessToken,
    );
    await saveOauthRecord(hubId, tokensInfo);
    console.log("OAuth process completed for hub:", hubId);

    res.redirect("/");
  });

  return router;
};

function getRedirectUrl(basePath: string, callbackPath: string) {
  const BASE_URL = removeTrailingSlash(config.env.APP_BASE_URL);
  return BASE_URL + basePath + callbackPath;
}

function getAuthorizeUrl(redirectUrl: string) {
  // !!!IMPORTANT!!! redirect_uri must be one of the urls in the app's Auth settings
  const CLIENT_ID = config.env.HUBSPOT_CLIENT_ID;
  const SCOPES = "crm.objects.deals.read crm.objects.deals.write"; // space separated
  return (
    "https://app.hubspot.com/oauth/authorize" +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}`
  );
}

async function saveOauthRecord(hubId: number, tokensInfo: TokenResponseIF) {
  const { accessToken, refreshToken, expiresIn } = tokensInfo;
  let record = await OauthToken.findByPk(hubId);
  if (record !== null) {
    record.set({
      refreshToken,
      accessToken,
      refreshedAt: Date.now(),
      expiresIn: expiresIn * 1000 * 0.8, // milliseconds
      disabled: false,
    });
    record.save();
  } else {
    record = await OauthToken.create({
      hubId,
      createdAt: Date.now(),
      refreshToken,
      accessToken,
      refreshedAt: Date.now(),
      expiresIn: expiresIn * 1000 * 0.8, // milliseconds
      disabled: false,
    });
  }
}
