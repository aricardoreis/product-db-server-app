import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import packageJson from "../package.json";
import { Scraper } from "./scraper";
import { isValidUrl } from "./utils/validator";
import { AppResponse } from "./models";
import { ApplicationError } from "./utils/exception";

dotenv.config();

console.log("PORT", process.env.PORT);

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send(`Welcome to Product DB version ${packageJson.version}!`);
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

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
