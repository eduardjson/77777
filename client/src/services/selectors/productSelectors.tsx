import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { productApi } from "../api";

const selectAllProducts = (state: RootState) => {
  return productApi.endpoints.getAllProducts.select()(state)?.data ?? [];
};

const selectFilterState = (state: RootState) => state.filter;

export const selectUniqueManufacturers = createSelector(
  [selectAllProducts],
  products => {
    const manufacturers = products
      .map(product => product.manufacturer)
      .filter((value, index, self) => value && self.indexOf(value) === index)
      .sort();
    return manufacturers;
  },
);

export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectFilterState],
  (products, filter) => {
    return products.filter(product => {
      const matchesSearch =
        filter.searchQuery === "" ||
        product.title.toLowerCase().includes(filter.searchQuery.toLowerCase());

      const matchesManufacturer =
        filter.manufacturer === "" ||
        product.manufacturer === filter.manufacturer;

      const matchesMinPrice =
        filter.minPrice === null || product.price >= filter.minPrice;

      const matchesMaxPrice =
        filter.maxPrice === null || product.price <= filter.maxPrice;

      return (
        matchesSearch &&
        matchesManufacturer &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  },
);

export const selectFilterStats = createSelector(
  [selectFilteredProducts],
  filteredProducts => ({
    totalCount: filteredProducts.length,
    averagePrice:
      filteredProducts.length > 0
        ? Math.round(
            filteredProducts.reduce((sum, p) => sum + p.price, 0) /
              filteredProducts.length,
          )
        : 0,
    totalQuantity: filteredProducts.reduce(
      (sum, p) => sum + (p.quantity || 0),
      0,
    ),
  }),
);
