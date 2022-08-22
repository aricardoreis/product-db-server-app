import * as db from "./firestore";

const PRODUCTS_COLLECTION = "products";

export const getAll = async () => {
  await db.fetch(PRODUCTS_COLLECTION);
};

export const get = async (key: string) => {
  await db.fetch(PRODUCTS_COLLECTION, key);
};

export const create = async (product: any, key?: string, storeRef?: string) => {
  await db.insert(PRODUCTS_COLLECTION, product, key);
};

export const createMany = async (products: unknown[]) => {
  await db.insertMany(PRODUCTS_COLLECTION, products);
};
