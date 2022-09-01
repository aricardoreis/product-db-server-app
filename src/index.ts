import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Scraper } from "./scraper";
import { productDB, storeDB, saleDB } from "./db";
import { isValidUrl } from "./utils/validator";
import { deleteAll } from "./db/firestore";
import { AppResponse, Sale } from "./models";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8888;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Product DB!");
});

app.get("/delete-all", async (req: Request, res: Response) => {
  deleteAll("products");
  deleteAll("sales");
  deleteAll("stores");

  res.send(AppResponse.create(true, "done"));
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
    data.products.forEach(
      async (element) =>
        await productDB.create(element, null, data.sale.id, data.store.id)
    );

    res.send({
      success: true,
      result: `The invoice with id ${data.sale.id} has been saved.`,
    } as AppResponse);
  } catch (e) {
    if (e instanceof Error) {
      res.status(500);
      res.send({
        success: false,
        result: e.message,
      } as AppResponse);
    }
  }
});

app.get("/products", async (req: Request, res: Response) => {
  const products = await productDB.getAll();
  res.send(AppResponse.create(true, products));
});

app.get("/sales/:key", async (req, res: Response) => {
  const { key } = req.params;

  const sale = await saleDB.get(key);
  if (sale) {
    res.status(404);
  }

  res.send(AppResponse.create(true, Sale.fromJson(sale)));
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
