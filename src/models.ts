export interface Product {
  name: string;
  value: number;
  type: ItemType;
  code: number;
  date: string;
  saleId: string;
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
