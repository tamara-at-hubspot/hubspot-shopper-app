import type { Express } from "express";
import express from "express";
import { normalizePath, removeTrailingSlash } from "../utils";
import config from "../config";
import hubspot from "../clients/hubspot";
import oauthDao from "../data/daos/oauthDao";

export const useOauth = (app: Express, path: string) => {
  const basePath = normalizePath(path);
  app.use(basePath, OauthController(basePath));
};

const OauthController = (basePath: string) => {
  const router = express.Router();

  const installPath = "/install";
  const callbackPath = "/callback";

  // Oauth setup UI
  router.get("", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write("<h2>HubSpot OAuth 2.0 Setup</h2>");

    const hubId = await oauthDao.getFirstHubId();
    if (hubId === undefined) {
      res.write(
        `<a href="${basePath}${installPath}">Click here to install the app</a>`,
      );
    } else {
      const apiClient = await hubspot.getApiClient(hubId);
      res.write("<h3>API Test</h3>");
      res.write(`<b>Hub ID</b>: ${await oauthDao.getFirstHubId()}<br>`);
      res.write(`<b>Access token</b>: [redacted]<p>`);
      const deals = await apiClient.crm.deals.basicApi.getPage(1);
      deals.results.forEach((deal) => {
        res.write(`${deal.id}: ${JSON.stringify(deal.properties)}<br>`);
      });
      res.write(
        `<p><a href="${basePath}${installPath}">Click here to install the app in more hubs!</a>`,
      );
    }
    res.end();
  });

  // request to install the app by initiating OAuth access
  router.get(installPath, async (req, res) => {
    const redirectUrl = getRedirectUrl(basePath, callbackPath);
    const authorizeUrl = getAuthorizeUrl(redirectUrl);
    console.log("Initiating OAuth access:", authorizeUrl);
    res.redirect(authorizeUrl); // redirect the user to the HubSpot to give permission
  });

  // accept callback from HubSpot to complete the OAuth handshake
  router.get(callbackPath, async (req, res) => {
    const code = req.query?.code as string | undefined;
    console.log("Exchanging auth code for token:", code);
    await hubspot.exchangeAuthCodeForToken(
      code ?? "",
      getRedirectUrl(basePath, callbackPath),
    );
    res.redirect(basePath);
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
