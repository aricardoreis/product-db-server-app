import { Product, Sale } from "../models";

const sortProductsByName = (p1: Product, p2: Product) => {
  return p1.name.localeCompare(p2.name);
};

const sortSalesByDate = (s1: Sale, s2: Sale) => {
  return s1.date.getTime() - s2.date.getTime();
};

export { sortProductsByName as sortProductsAsc, sortSalesByDate };
