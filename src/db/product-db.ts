import {
  DocumentData,
  DocumentReference,
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";
import { Product } from "../models/models";
import { getInstanceDB } from "./firestore";
import * as db from "./firestore";
import * as saleDB from "./sale-db";
import * as storeDB from "./store-db";

const COLLECTION = "products";

export const getAll = async () => {
  try {
    const items = await db.fetch(COLLECTION);
    console.log("items count", items.length);

    return items.map((item: any) => Product.fromJson(item));
  } catch (e) {
    if (e instanceof Error) {
      console.error("Something went wrong", e);
    }
  }
};

export const get = async (key: string) => {
  return Product.fromJson(await db.fetch(COLLECTION, key));
};

export const getRefByCode = async (
  code: string
): Promise<DocumentReference<DocumentData>> => {
  return await db.getRefByAttributeValue(COLLECTION, "code", code);
};

export const create = async (
  product: any,
  key?: string,
  saleId?: string,
  storeId?: string
) => {
  const existingProduct = await getRefByCode(product.code);
  const firestoreDB = await getInstanceDB();
  const storeRef = firestoreDB.doc(`${storeDB.COLLECTION}/${storeId}`);
  const saleRef = await getSaleRef(saleId);
  const shouldUpdate = shouldUpdateProduct(existingProduct, product);
  if (shouldUpdate) {
    // update existing one, adding a new price
    await existingProduct.update({
      priceHistory: FieldValue.arrayUnion({
        date: product.date,
        value: product.value,
        store: storeRef,
        sale: saleRef,
        timestamp: Timestamp.fromMillis(new Date().valueOf()),
      }),
    });
  } else {
    // create new product on db
    const productEntity = {
      ...product,

      date: Timestamp.fromMillis(product.date),
      isEAN: hasEANCode(product),
      priceHistory: [
        {
          date: product.date,
          value: product.value,
          store: storeRef,
          sale: saleRef,
          timestamp: Timestamp.fromMillis(new Date().valueOf()),
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

function hasEANCode(product: any): boolean {
  return product.code.length === 13 || product.code.length === 8;
}

function shouldUpdateProduct(
  productRef: DocumentReference<DocumentData>,
  product: any
): boolean {
  return productRef && hasEANCode(product);
}
