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

export interface Sale {
  id: string;
  storeId: string;
  date: string;
  total: number;
}

export enum ItemType {
  Unit,
  Piece,
  Kilo,
}

export interface AppResponse {
  success: boolean;
  result: any;
}
