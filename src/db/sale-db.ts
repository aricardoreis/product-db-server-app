import { Timestamp } from "firebase-admin/firestore";
import * as db from "./firestore";
import * as storeDB from "./store-db";

export const COLLECTION = "sales";

export const create = async (sale: any, storeId: string, key?: string) => {
  const firestoreDB = await db.getInstanceDB();
  const storeRef = firestoreDB.doc(`${storeDB.COLLECTION}/${storeId}`);
  const saleEntity = {
    ...sale,
    store: storeRef,
    date: Timestamp.fromMillis(sale.date),
  };
  await db.insert(COLLECTION, saleEntity, key);
};

export const get = async (key: string) => {
  await db.fetch(COLLECTION, key);
};
