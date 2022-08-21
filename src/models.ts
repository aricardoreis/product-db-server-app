export interface Product {
  name: string;
  value: number;
  type: ItemType;
  code: number;
}

export enum ItemType {
  Unit,
  Piece,
  Kilo,
}
