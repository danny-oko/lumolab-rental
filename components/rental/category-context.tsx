"use client";

import { DEFAULT_CATEGORIES, type CategoryDef } from "@/lib/rental/categories";
import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

type CategoryContextValue = {
  categories: CategoryDef[];
};

const CategoryContext = createContext<CategoryContextValue>({
  categories: DEFAULT_CATEGORIES,
});

type CategoryProviderProps = {
  categories: CategoryDef[];
  children: ReactNode;
};

export function CategoryProvider({ categories, children }: CategoryProviderProps) {
  return (
    <CategoryContext.Provider value={{ categories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext).categories;
}
