import * as db from "./firestore";

export const COLLECTION = "stores";

export const create = async (store: any, key?: string) => {
  await db.insert(COLLECTION, store, key);
};

export const get = async (key: string) => {
  await db.fetch(COLLECTION, key);
};

export const getRef = async (id: string) => {
  return await db.getRefByAttributeValue(COLLECTION, "id", id);
};

export const remove = async (id: string) => {
  const ref = await getRef(id);
  if (ref) ref.delete();
};
