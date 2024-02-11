import type { Express } from "express";
import dao from "../data/dao";

export const useHome = (app: Express) => {
  app.get("/", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write("<h2>HubSpot Shopper App</h2>");

    const hubIds = await dao.getAllHubIds();
    res.write(`<p><b>Installs</b>: ${hubIds.length}</p>`);
    hubIds.slice(0, 10).forEach((hubId) => {
      res.write(`${hubId}<br>`);
    });
    if (hubIds.length > 10) {
      res.write(`...and more!<br>`);
    }
    res.write(`<p><a href="/oauth">OAuth setup</a>`);

    res.end();
  });
};
