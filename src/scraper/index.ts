import * as puppeteer from "puppeteer";
import { ApplicationError } from "../utils/exception";

export class Scraper {
  private static instance: Scraper;

  protected baseUrl: string;
  private browser: puppeteer.Browser;
  protected page: puppeteer.Page;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  launchBrowser = async () => {
    this.browser = await puppeteer.launch({
      headless: true,
      devtools: false,
      defaultViewport: {
        width: 1024 + Math.floor(Math.random() * 100),
        height: 768 + Math.floor(Math.random() * 100),
      },
      ignoreHTTPSErrors: true,
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
    try {
      await this.initPage(this.baseUrl);

      const store = await this.loadStoreInfo();
      const sale = await this.loadSaleInfo();
      const products = await this.loadProductInfo(sale.date);

      return {
        store,
        sale,
        products,
      };
    } catch (error) {
      throw error;
    } finally {
      this.close();
    }
  };

  loadSaleInfo = async () => {
    return await this.page.evaluate((_: string) => {
      const datePart = document.querySelector(
        "#infos > div:nth-child(1) > div > ul > li"
      ).textContent;
      const dateTokens = datePart
        .match(/(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/)[0]
        .split("/")
        .map((i) => parseInt(i));

      const sale = {
        id: document
          .querySelector("#infos > div:nth-child(2) > div > ul > li")
          .textContent.replace(/\D/g, ""),
        total: parseFloat(
          document
            .querySelector("#linhaTotal > .txtMax")
            .textContent.replace(",", ".")
        ),
        date: Date.UTC(dateTokens[2], dateTokens[1] - 1, dateTokens[0]),
      };
      return sale;
    }, null);
  };

  loadStoreInfo = async () => {
    const store = await this.page.evaluate((sel: string) => {
      const topContent = document.querySelector(sel);
      if (!topContent) {
        // page content is not valid
        return null;
      }
      const values = topContent.querySelectorAll(".text");
      const idTokens = values[0].textContent.split("\n").map((i) => i.trim());
      const store = {
        id: idTokens[idTokens.length - 1].replace(/[.\/-]?/g, ""),
        name: topContent.querySelector(".txtTopo").textContent,
        storeAddress: values[1].textContent
          .split("\n")
          .map((i) => {
            let item = i.trim();
            if (item === ",") item += " ";
            return item;
          })
          .join(""),
      };
      return store;
    }, "#conteudo > div.txtCenter");
    if(!store) {
      throw new ApplicationError("Store not found");
    }
    return store;
  };

  private async loadProductInfo(date: number) {
    const products = await this.page.evaluate((sel: string) => {
      const trimAndSlice = (text: string, separator: string) =>
        text.trim().split(separator);

      const products: any[] = [];
      const rows = Array.from(document.querySelectorAll(sel));
      rows.forEach((item) => {
        const unitType = item.querySelector(".RUN").textContent.split(" ")[1];
        const valueTokens = trimAndSlice(
          item.querySelector(".RvlUnit").textContent,
          " "
        );
        const codeTokens = trimAndSlice(
          item.querySelector(".RCod").textContent,
          ":"
        );
        const amountTokens = trimAndSlice(
          item.querySelector(".Rqtd").textContent,
          ":"
        );
        products.push({
          name: item.querySelector(".txtTit").textContent,
          value: parseFloat(
            valueTokens[valueTokens.length - 1].trim().replace(",", ".")
          ),
          code: codeTokens[1].replace(")", "").trim(),
          amount: parseFloat(
            amountTokens[amountTokens.length - 1].trim().replace(",", ".")
          ),
          type: unitType,
        });
      });

      return products;
    }, "#tabResult tr");

    return products.map((item) => ({ ...item, date }));
  }

  public close = async () => {
    await this.page.close();
    await this.browser.close();
  };
}
