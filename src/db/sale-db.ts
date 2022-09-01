import * as db from "./firestore";
import * as storeDB from "./store-db";

export const COLLECTION = "sales";

export const create = async (sale: any, storeId: string, key?: string) => {
  const firestoreDB = await db.getInstanceDB();
  const storeRef = firestoreDB.doc(`${storeDB.COLLECTION}/${storeId}`);
  const saleEntity = {
    ...sale,
    store: storeRef,
    date: sale.date,
  };
  await db.insert(COLLECTION, saleEntity, key);
};

export const get = async (id: string) => {
  const sale = await db.fetch(COLLECTION, id);
  return sale;
};
