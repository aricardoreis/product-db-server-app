import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Scraper } from "./scraper";
import { productDB, storeDB, saleDB } from "./db";
import { isValidUrl } from "./utils/validator";
import { deleteAll } from "./db/firestore";
import { AppResponse, Sale } from "./models";
import { ApplicationError } from "./utils/exception";
import { sortProductsAsc } from "./utils/sorting";
import { addProductsToSale, remove as removeProduct } from "./db/product-db";
import { mockSale } from "./utils/constants";
import { remove as removeSale } from "./db/sale-db";
import { remove as removeStore } from "./db/store-db";
import cors from "cors";
import { PSM, createWorker } from "tesseract.js";
import path from "path";

dotenv.config();

console.log("PORT", process.env.PORT);

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Product DB!");
});

app.get("/delete-all", async (_req: Request, res: Response) => {
  deleteAll("products");
  deleteAll("sales");
  deleteAll("stores");

  res.send(AppResponse.create(true, "done"));
});

app.get("/fakeLoad", async (req, res) => {
  const data = mockSale;

  // await storeDB.create(data.store, data.store.id);
  // await saleDB.create(data.sale, data.store.id, data.sale.id);
  // const productRefs = await Promise.all(
  //   data.products.map(
  //     async (element) =>
  //       await productDB.create(element, null, data.sale.id, data.store.id)
  //   )
  // );

  // await addProductsToSale(data.sale.id, productRefs);

  await removeSale(data.sale.id);
  await removeStore(data.store.id);
  await Promise.all(
    data.products.map(async (item) => await removeProduct(item.code))
  );

  res.send("OK");
});

app.post("/fetchInvoiceData", async (req, res: Response) => {
  try {
    const { url } = req.body;

    console.log("Loading invoice from url " + url);

    if (!url) {
      throw new ApplicationError("You should provide the invoice url!");
    }

    if (!isValidUrl(url)) {
      throw new ApplicationError("Invalid URL!");
    }

    const scraper = new Scraper(url);
    const data = await scraper.load();

    res.send(AppResponse.create(true, data));
  } catch (e) {
    if (e instanceof Error) {
      console.log("[ERROR]", e, e.stack);
    }
    let statusCode = 500;
    let message = "Something went wrong";

    if (e instanceof ApplicationError) {
      statusCode = 400;
      message = e.message;
    }

    res.status(statusCode);
    res.send(AppResponse.create(false, message));
  }
});

app.post("/load", async (req, res: Response) => {
  try {
    const { url } = req.body;

    console.log("Loading invoice from url " + url);

    if (!url) {
      throw new ApplicationError("You should provide the invoice url!");
    }

    if (!isValidUrl(url)) {
      throw new ApplicationError("Invalid URL!");
    }

    const scraper = new Scraper(url);
    const data = await scraper.load();

    const sale = await saleDB.get(data.sale.id);
    if (sale) {
      throw new ApplicationError(`Sale already exists`);
    }

    await storeDB.create(data.store, data.store.id);
    await saleDB.create(data.sale, data.store.id, data.sale.id);
    const productRefs = await Promise.all(
      data.products.map(
        async (element) =>
          await productDB.create(element, null, data.sale.id, data.store.id)
      )
    );

    // add product refs to sale
    await addProductsToSale(data.sale.id, productRefs);

    res.send(
      AppResponse.create(
        true,
        `Invoice ${data.sale.id} has been saved with success!`
      )
    );
  } catch (e) {
    if (e instanceof Error) {
      console.log("[ERROR]", e, e.stack);
    }
    let statusCode = 500;
    let message = "Something went wrong";

    if (e instanceof ApplicationError) {
      statusCode = 400;
      message = e.message;
    }

    res.status(statusCode);
    res.send(AppResponse.create(false, message));
  }
});

app.get("/products", async (_req: Request, res: Response) => {
  const products = await productDB.getAll();
  res.send(AppResponse.create(true, products.sort(sortProductsAsc)));
});

app.get("/sales", async (_req, res: Response) => {
  const sales = await saleDB.getAll();
  res.send(AppResponse.create(true, sales));
});

app.get("/sales/:key", async (req, res: Response) => {
  const { key } = req.params;
  try {
    const sale = await saleDB.get(key);

    if (sale) {
      res.send(AppResponse.create(true, sale));
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(`Error when getting sale details for ${key}`);
    console.error(error);
  }
});

app.delete("/sales/:key", async (req, res: Response) => {
  const { key } = req.params;
  try {
    const sale = await saleDB.get(key);

    if (sale) {
      res.send(AppResponse.create(true, sale));
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(`Error when getting sale details for ${key}`);
    console.error(error);
  }
});

app.get("/loadPhotoData", async (req: Request, res: Response) => {
  const { url } = req.params;
  const result = await readDataFromPhotos(url);
  res.send(AppResponse.create(true, result));
})

const readDataFromPhotos = async (url: string) => {
  const image = path.resolve(__dirname, '../assets/img02.png');
  const worker = await createWorker('por');
  // // await worker.setParameters({
  // //   tessedit_char_whitelist: '0123456789',
  // // });
  // await worker.setParameters({
  //   tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
  // });
  const ret = await worker.recognize(image);
  console.log(`text: ${ret.data.text}`);
  await worker.terminate();
  return ret.data.text;
}

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
