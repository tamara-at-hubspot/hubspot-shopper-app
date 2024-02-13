import type { Express } from "express";
import express from "express";
import { normalizePath } from "../utils";
import { body, param, query, validationResult } from "express-validator";
import oauthDao from "../data/daos/oauthDao";
import listDao from "../data/daos/listDao";

// TODO add express-preconditions later

export const useList = (app: Express, path: string) => {
  const basePath = normalizePath(path);
  app.use(basePath, ListController());
};

const ListController = () => {
  const router = express.Router();

  /**
   * POST /list
   *
   * Create a list. Example request:
   * curl http://localhost:3000/list -H "Content-Type: application/json" -d '{"hubId":44542195,"objectId":16296377603,"objectTypeId":"0-3","name":"First List!"}'
   */
  router.post(
    "",
    body("hubId").isNumeric(),
    body("objectTypeId").trim().notEmpty().escape(),
    body("objectId").isNumeric(),
    body("name").trim().isLength({ min: 1, max: 200 }).escape(),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 0, max: 1000 })
      .escape(),
    async (req, res) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const installed = await oauthDao.isInstalledHub(req.body.hubId);
      if (!installed) {
        return res.status(403).send();
      }
      let list = await listDao.getListForObject(
        req.body.hubId,
        req.body.objectTypeId,
        req.body.objectId,
      );
      if (!!list) {
        return res.status(409).send();
      }
      list = await listDao.createList(req.body);
      return res.status(201).json(list.get());
    },
  );

  /**
   * GET /list
   *
   * Get lists for the given object. Example request:
   * curl http://localhost:3000/list?hubId=39719066&objectTypeId=0-3&objectId=14635242253
   */
  router.get(
    "",
    query("hubId").isNumeric().notEmpty(),
    query("objectTypeId").trim().notEmpty().escape(),
    query("objectId").isNumeric().notEmpty(),
    async (req, res) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const { hubId, objectTypeId, objectId } = req.query as any;
      const list = await listDao.getListForObject(
        hubId,
        objectTypeId,
        objectId,
      );
      if (!list) {
        return res.status(200).json({ results: [] });
      }
      return res.status(200).json({ results: [list.get()] });
    },
  );

  /**
   * GET /list/:listId
   *
   * Get a list by ID
   */
  router.get(
    "/:listId",
    param("listId").trim().notEmpty().escape(),
    async (req, res) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const list = await listDao.getList(req.params?.listId);
      if (!list) {
        return res.status(404).send();
      }
      return res.status(200).json(list.get());
    },
  );

  /**
   * PUT /list/:listId
   *
   * Replace a list by ID
   */
  router.put(
    "/:listId",
    param("listId").trim().notEmpty().escape(),
    // -- ignore --
    // body("hubId").isNumeric(),
    // body("objectTypeId").trim().notEmpty().escape(),
    // body("objectId").isNumeric(),
    body("name").trim().isLength({ min: 1, max: 200 }).escape(),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 0, max: 1000 })
      .escape(),
    async (req, res) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const id = req.params?.listId;
      try {
        const list = await listDao.updateList({ ...req.body, id });
        return res.status(200).json(list.get());
      } catch (err) {
        return res.status(404).send();
      }
    },
  );

  /**
   * DELETE /list/:listId
   *
   * Delete a list by ID
   */
  router.delete(
    "/:listId",
    param("listId").trim().notEmpty().escape(),
    async (req, res) => {
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
      }
      const id = req.params?.listId;
      try {
        await listDao.deleteList(id);
        return res.status(200).send();
      } catch (err) {
        return res.status(404).send();
      }
    },
  );

  return router;
};
