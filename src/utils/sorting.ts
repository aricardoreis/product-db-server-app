import { Product } from "../models";

const sortProductsByName = (p1: Product, p2: Product) => {
  return p1.name.localeCompare(p2.name);
};

export { sortProductsByName as sortProductsAsc };
