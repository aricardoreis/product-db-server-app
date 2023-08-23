import { DocumentReference } from "firebase-admin/firestore";
import { Sale } from "../models";
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
  const sale = await db.fetch(COLLECTION, null, null, id);

  if (sale) {
    const loadedStore = await db.getDataFromRef(sale.store);
    sale.store = loadedStore;

    const products = await Promise.all(
      sale.products.map(
        async (prodRef: DocumentReference) => await db.getDataFromRef(prodRef)
      )
    );
    sale.products = products;
  }

  return Sale.fromJsonWithDetails(sale);
};

export const getAll = async (): Promise<Sale[]> => {
  try {
    const items = await db.fetch(COLLECTION, "date", "desc");
    console.log("sales count", items.length);

    return items.map((item: any) => Sale.fromJson(item));
  } catch (e) {
    if (e instanceof Error) {
      console.error("Something went wrong", e);
    }
  }
};

export const getRef = async (id: string) => {
  return await db.getRefByAttributeValue(COLLECTION, "id", id);
};

export const remove = async (id: string) => {
  const ref = await getRef(id);
  if (ref) ref.delete();
};
