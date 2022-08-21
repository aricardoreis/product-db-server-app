import * as puppeteer from "puppeteer";
import { Product } from "./models";

export class Scraper {
  private static instance: Scraper;

  protected baseUrl: string;
  private browser: puppeteer.Browser;
  protected page: puppeteer.Page;

  protected constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static getInstance = (baseUrl: string): Scraper => {
    if (!Scraper.instance) {
      Scraper.instance = new Scraper(baseUrl);
    }
    return Scraper.instance;
  };

  launchBrowser = async () => {
    this.browser = await puppeteer.launch({
      headless: true,
      devtools: false,
      defaultViewport: {
        width: 1024 + Math.floor(Math.random() * 100),
        height: 768 + Math.floor(Math.random() * 100),
      },
      args: [
        "--allow-file-access-from-files",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
  };

  initPage = async (url: string) => {
    await this.launchBrowser();
    this.page = await this.browser.newPage();
    await this.page.goto(url);
  };

  load = async () => {
    await this.initPage(this.baseUrl);

    const products = await this.page.evaluate((sel: string) => {
      const products = [];

      const datePart = document.querySelector(
        "#infos > div:nth-child(1) > div > ul > li"
      ).textContent;
      const dateTokens = datePart
        .match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/)[0]
        .split("/")
        .map((i) => parseInt(i));
      const date = dateTokens.join("/");

      const rows = Array.from(document.querySelectorAll(sel));
      rows.forEach((item) => {
        const unitType = item.querySelector(".RUN").textContent.split(" ")[1];
        products.push({
          name: item.querySelector(".txtTit").textContent,
          value: parseFloat(
            item
              .querySelector(".RvlUnit")
              .textContent.trim()
              .split(" ")[2]
              .replace(",", ".")
          ),
          code: parseInt(
            item
              .querySelector(".RCod")
              .textContent.split(" ")[1]
              .replace(")", "")
              .trim()
          ),
          type: unitType,
          date,
        });
      });

      return products;
    }, "#tabResult tr");

    this.close();

    return products as Product[];
  };

  public close = async () => {
    await this.page.close();
    await this.browser.close();
  };
}
