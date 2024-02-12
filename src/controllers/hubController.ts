import type { Express } from "express";
import express from "express";
import { normalizePath } from "../utils";
import listDao from "../data/daos/listDao";
import oauthDao from "../data/daos/oauthDao";
import { param, validationResult } from "express-validator";

export const useHub = (app: Express, path: string) => {
  const basePath = normalizePath(path);
  app.use(basePath, HubController());
};

const HubController = () => {
  const router = express.Router();

  /**
   * GET /hub (text/html)
   *
   * Show a list of hubs with links to those with lists
   */
  router.get("", async (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.write("<h2>Hubs</h2>");

    const allHubIds = await oauthDao.getAllHubIds();
    const hubIdsWithLists = await listDao.getHubIds();

    allHubIds.forEach((hubId) => {
      if (hubIdsWithLists.has(hubId)) {
        res.write(`<a href="/hub/${hubId}">${hubId}</a><br>`);
      } else {
        res.write(`${hubId}<br>`);
      }
    });

    res.end();
  });

  /**
   * GET /hub/:hubId (text/html)
   *
   * Show lists for a given hub
   */
  router.get("/:hubId", param("hubId").isNumeric(), async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).send({ errors: result.array() });
    }

    res.setHeader("Content-Type", "text/html");
    res.write(`<h2>Lists</h2>`);

    res.write(`<p><b>Hub ID</b>: ${req.params?.hubId}</p>`);

    const lists = await listDao.getListsForHub(req.params?.hubId);
    lists.forEach((list) => {
      res.write(`<a href="/list/${list.id}">${list.id}</a><br>`);
    });

    res.end();
  });

  return router;
};
