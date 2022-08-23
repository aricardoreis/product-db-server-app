import { initializeApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

let dbInstance: FirebaseFirestore.Firestore;

export const getInstanceDB = async () => {
  if (!dbInstance) {
    initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
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
