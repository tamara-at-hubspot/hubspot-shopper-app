import type { Express } from "express";
import oauthDao from "../data/daos/oauthDao";

export const useHome = (app: Express) => {
  app.get("/", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write("<h2>HubSpot Shopper App</h2>");

    const hubIds = await oauthDao.getAllHubIds();
    res.write(`<p><b>Installs</b>: ${hubIds.length}</p>`);

    res.write(`<p><a href="/oauth">OAuth setup</a>`);
    res.write(`<p><a href="/hub">Installed hubs</a>`);

    res.end();
  });
};
