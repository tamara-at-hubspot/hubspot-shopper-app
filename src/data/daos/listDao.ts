import { InferCreationAttributes } from "sequelize";
import { List } from "../models";

function getListForObject(
  hubId: number,
  objectTypeId: string,
  objectId: number,
): Promise<List | null> {
  return List.findOne({
    where: { hubId, objectTypeId, objectId },
  });
}

function getList(id: string): Promise<List | null> {
  return List.findByPk(id);
}

async function getHubIds(): Promise<Set<number>> {
  const lists = await List.findAll();
  return new Set(lists.map((list) => list.hubId));
}

function getListsForHub(hubId: number): Promise<List[]> {
  return List.findAll({
    where: { hubId },
    order: ["objectTypeId", "objectId"],
  });
}

function createList(list: InferCreationAttributes<List>): Promise<List> {
  return List.create(list);
}

export default {
  createList,
  getList,
  getListForObject,
  getHubIds,
  getListsForHub,
};
