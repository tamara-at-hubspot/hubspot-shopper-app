import { InferAttributes, InferCreationAttributes } from "sequelize";
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

async function updateList(update: InferAttributes<List>): Promise<List> {
  const list = await List.findByPk(update.id);
  if (list === null) {
    throw new Error(`List ${update.id} not found`);
  }
  await list.update(List.sanitizeForUpdate(update));
  await list.save();
  return list;
}

async function deleteList(id: string): Promise<void> {
  const list = await List.findByPk(id);
  if (list === null) {
    throw new Error(`List ${id} not found`);
  }
  await list.destroy();
}

export default {
  getList,
  getListForObject,
  getHubIds,
  getListsForHub,
  createList,
  updateList,
  deleteList,
};
