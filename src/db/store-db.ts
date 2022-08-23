import * as db from "./firestore";

export const COLLECTION = "stores";

export const create = async (store: any, key?: string) => {
  await db.insert(COLLECTION, store, key);
};

export const get = async (key: string) => {
  await db.fetch(COLLECTION, key);
};
