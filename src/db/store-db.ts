import * as db from "./firestore";

const STORE_COLLECTION = "stores";

export const create = async (store: any, key?: string) => {
  await db.insert(STORE_COLLECTION, store, key);
};

export const get = async (key: string) => {
  await db.fetch(STORE_COLLECTION, key);
};
