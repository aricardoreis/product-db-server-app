import { DocumentData, FieldValue, Timestamp } from "firebase-admin/firestore";
import { Product } from "../models/models";
import * as db from "./firestore";
import * as saleDB from "./sale-db";

const COLLECTION = "products";

export const getAll = async () => {
  const items = await db.fetch(COLLECTION);
  return items.map((item: any) => Product.fromJson(item));
};

export const get = async (key: string) => {
  return Product.fromJson(await db.fetch(COLLECTION, key));
};

export const getByCode = async (code: string): Promise<DocumentData> => {
  return await db.getByAttributeValue(COLLECTION, "code", code);
};

export const create = async (product: any, key?: string, saleId?: string) => {
  const existingProduct = await getByCode(product.code);
  if (existingProduct) {
    // update existing one, adding a new price
    console.log(">>", existingProduct);
    await existingProduct.update({
      priceHistory: FieldValue.arrayUnion({
        date: product.date,
        value: product.value,
      }),
    });
  } else {
    // create new product on db
    const productEntity = {
      ...product,

      sale: await getSaleRef(saleId),
      date: Timestamp.fromMillis(product.date),
      priceHistory: [
        {
          date: product.date,
          value: product.value,
        },
      ],
    };

    delete productEntity.value;

    await db.insert(COLLECTION, productEntity, key);
  }
};

export const createMany = async (products: any[], saleId: string) => {
  const saleRef = await getSaleRef(saleId);
  products = products.map((item) => ({
    ...item,
    sale: saleRef,
  }));
  await db.insertMany(COLLECTION, products);
};

async function getSaleRef(saleId: string) {
  const firestoreDB = await db.getInstanceDB();
  const saleRef = firestoreDB.doc(`${saleDB.COLLECTION}/${saleId}`);
  return saleRef;
}
