import express, { Express, Request, Response } from "express";
import { Scraper } from "./scraper";
import dotenv from "dotenv";
import { productDB, storeDB, saleDB } from "./db";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8888;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Product DB!");
});

app.post("/load", async (req, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(500);
    res.send("You should provide the invoice url!");
    return;
  }

  const scraper = Scraper.getInstance(url);
  const data = await scraper.load();

  await storeDB.create(data.store, data.store.id);
  await saleDB.create(data.sale, data.store.id, data.sale.id);
  await productDB.createMany(data.products, data.sale.id);

  res.send(`The invoice with id ${data.sale.id} has been saved.`);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
