import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

let dbInstance: FirebaseFirestore.Firestore;

const getInstanceDB = async () => {
  if (!dbInstance) {
    const serviceAccount = require(process.env.SERVICE_ACCOUNT_KEY);

    initializeApp({
      credential: cert(serviceAccount),
    });

    dbInstance = getFirestore();
  }
  return dbInstance;
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

export const fetch = async (collectionName: string, key?: string) => {
  const db = await getInstanceDB();

  const snapshot = await db.collection(collectionName).get();
  if (key) return snapshot.docs.find((item) => item.id === key)?.data();
  else return snapshot.docs.map((doc) => doc.data());
};
