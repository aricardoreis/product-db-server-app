import express, { Express, Request, Response } from "express";
import { fetch, insert } from "./db/firestore";
import { Scraper } from "./scraper";
import dotenv from "dotenv";
import { products, stores } from "./db";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8888;

const NF_URL =
  "http://www.dfe.ms.gov.br/nfce/qrcode/?p=50220606057223030240650030001315781032562660|2|1|1|8157FCB76A5B47C4DECC4C1A4617B92B2A6196BE";

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/load", async (req: Request, res: Response) => {
  const scraper = Scraper.getInstance(NF_URL);
  const data = await scraper.load();

  // await products.createMany(data.products);
  // await stores.create(data.store, data.store.id);
  // const store = await stores.get(data.store.id);

  // data.products.forEach((product) => {
  //   insertProduct(product);
  // });

  // insertStore(data.store);
  // insertSale(data.sale);

  // await insert("users", {
  //   name: "Fulano",
  //   born: 1989,
  // });

  // const item = await fetch("users");

  res.send(data);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
