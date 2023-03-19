export class Product {
  name: string;
  type: string;
  code: string;
  amount: number;
  priceHistory: PriceHistory[];

  static fromJson = (jsonData: any): Product => {
    return {
      name: jsonData["name"],
      type: jsonData["type"],
      code: jsonData["code"],
      amount: jsonData["amount"],
      priceHistory: jsonData.priceHistory.map((item: any) =>
        PriceHistory.fromJson(item)
      ),
    } as Product;
  };
}

export class PriceHistory {
  date: Date;
  value: number;

  static fromJson = (jsonData: any): PriceHistory => {
    return {
      date: new Date(jsonData["date"]),
      value: jsonData["value"],
    };
  };
}

export interface Store {
  id: string;
  storeName: string;
  storeAddress: string;
}

export class Sale {
  id: string;
  date: Date;
  total: number;
  store: Store;
  products: Product[];

  static fromJson = (jsonData: any): Sale => {
    if (!jsonData) return null;
    return {
      id: jsonData["id"],
      date: new Date(jsonData["date"]),
      total: jsonData["total"],
      store: jsonData["store"],
      products: jsonData["products"].map((product: any) =>
        Product.fromJson(product)
      ),
    } as Sale;
  };
}

export enum ItemType {
  Unit,
  Piece,
  Kilo,
}

export class AppResponse {
  success: boolean;
  result: any;

  static create = (success: boolean, result: any) => {
    return {
      success,
      result,
    };
  };
}
