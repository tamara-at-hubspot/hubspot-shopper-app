import type { Express } from "express";
import { OauthToken } from "../models";
import { Client } from "@hubspot/api-client";

export const useHome = (app: Express) => {
  app.get("/", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write(`<h2>HubSpot Shopper App</h2>`);

    const record = await OauthToken.findOne();
    if (record === null) {
      res.write(`<a href="/oauth/install">Click here to install the app</a>`);
    } else {
      res.write(`<p>Access token: [redacted]</p>`);
      const hubspotClient = new Client({ accessToken: record.accessToken });
      const deals = await hubspotClient.crm.deals.basicApi.getPage(1);
      deals.results.forEach((deal) => {
        res.write(`<p>${deal.id}: ${JSON.stringify(deal.properties)}`);
      });
    }
    res.end();
  });
};
