import express, { Express, Request, Response } from "express";
import { Scraper } from "./scraper";
import dotenv from "dotenv";
import { productDB, storeDB, saleDB } from "./db";
import { isValidUrl } from "./utils/validator";
import { deleteAll } from "./db/firestore";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8888;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Product DB!");
});

app.get("/delete-all-resources", async (req: Request, res: Response) => {
  deleteAll("products");
  deleteAll("sales");
  deleteAll("stores");
  res.send("Done");
});

app.post("/load", async (req, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      throw "You should provide the invoice url!";
    }

    if (!isValidUrl(url)) {
      throw "Invalid URL!";
    }

    const scraper = Scraper.getInstance(url);
    const data = await scraper.load();

    await storeDB.create(data.store, data.store.id);
    await saleDB.create(data.sale, data.store.id, data.sale.id);
    await productDB.createMany(data.products, data.sale.id);

    res.send(`The invoice with id ${data.sale.id} has been saved.`);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500);
      res.send(e.message);
    }
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
