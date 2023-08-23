import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import {
  DocumentData,
  DocumentReference,
  getFirestore,
} from "firebase-admin/firestore";

const QUERY_LIMIT = 10;

let dbInstance: FirebaseFirestore.Firestore;

export const getInstanceDB = async () => {
  if (!dbInstance) {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_CLIENT_EMAIL
    )
      throw "You need to set the firebase variables!";

    initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: getFirebasePrivateKey(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });

    dbInstance = getFirestore();
  }
  return dbInstance;
};

const getFirebasePrivateKey = () => {
  try {
    const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
    return privateKey;
  } catch (error) {
    return process.env.FIREBASE_PRIVATE_KEY;
  }
};

const getDocRef = (
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  key?: string
) => {
  const dbCollection = db.collection(collectionName);
  return key ? dbCollection.doc(key) : dbCollection.doc();
};

export const insert = async (
  collectionName: string,
  data: any,
  key?: string
) => {
  const db = await getInstanceDB();

  const docRef = getDocRef(db, collectionName, key);
  await docRef.set(data);
};

export const insertMany = async (collectionName: string, items: unknown[]) => {
  const db = await getInstanceDB();
  await db.runTransaction(async (t) => {
    items.forEach((item) => {
      const newDocRef = db.collection(collectionName).doc();
      t.create(newDocRef, item);
    });
  });
};

export const fetch = async (
  collectionName: string,
  orderByAttr?: string,
  orderByType?: "asc" | "desc"
): Promise<any> => {
  const db = await getInstanceDB();

  const collection = db.collection(collectionName);
  let snapshot = collection.limit(QUERY_LIMIT);

  if (orderByAttr) {
    snapshot = snapshot.orderBy(orderByAttr, orderByType);
  }

  const queryResult = await snapshot.get();
  return queryResult.docs.map((doc) => ({ ...doc.data(), _id: doc.id }));
};

export const getByKey = async (collectionName: string, key: string) => {
  const db = await getInstanceDB();

  const queryResult = await db
    .collection(collectionName)
    .where("id", "==", key)
    .get();

  return queryResult.docs.length > 0 ? queryResult.docs[0].data() : null;
};

export const getRefByAttributeValue = async (
  collectionName: string,
  attribute: string,
  value: any
): Promise<DocumentReference<DocumentData>> => {
  const db = await getInstanceDB();

  const collection = db.collection(collectionName);
  const querySnapshot = await collection.where(attribute, "==", value).get();

  return querySnapshot.docs.length > 0 ? querySnapshot.docs[0].ref : null;
};

export const getDataFromRef = async (ref: DocumentReference) => {
  const snapshot = await ref.get();
  return snapshot.data();
};

export const deleteAll = async (collectionName: string) => {
  const db = await getInstanceDB();
  db.collection(collectionName)
    .get()
    .then((querySnapshot) => {
      querySnapshot.docs.forEach((snapshot) => {
        snapshot.ref.delete();
      });
    });
};
