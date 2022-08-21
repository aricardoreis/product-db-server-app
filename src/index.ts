import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import * as puppeteer from "puppeteer";
import { Scraper } from "./scraper";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8888;

const NF_URL =
  "http://nfce.sefaz.pe.gov.br/nfce/consulta?p=26220306057223042761650260000047251260098148%7C2%7C1%7C1%7C4DF204E1731C295B86D989CF8C0D729129257FA2";

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/load", async (req: Request, res: Response) => {
  const scraper = Scraper.getInstance(NF_URL);
  const data = await scraper.load();
  res.send(data);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
