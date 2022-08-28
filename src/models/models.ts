export class Product {
  name: string;
  value: number;
  type: string;
  code: number;
  date: Date;
  amount: number;

  static fromJson = (jsonData: any): Product => {
    return {
      name: jsonData["name"],
      value: jsonData["value"],
      type: jsonData["type"],
      code: jsonData["code"],
      date: new Date(jsonData["date"]),
      amount: jsonData["amount"],
    } as Product;
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
