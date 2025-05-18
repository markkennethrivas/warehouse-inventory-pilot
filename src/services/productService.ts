
import { Product } from "@/types";
import { mockProducts } from "./mockData";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getProducts = async (): Promise<Product[]> => {
  await delay(500);
  return [...mockProducts];
};

export const getProduct = async (id: string): Promise<Product | undefined> => {
  await delay(300);
  return mockProducts.find(product => product.id === id);
};

export const createProduct = async (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> => {
  await delay(600);
  const newProduct: Product = {
    id: `p${mockProducts.length + 1}`,
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  await delay(600);
  const index = mockProducts.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Product not found");
  
  mockProducts[index] = {
    ...mockProducts[index],
    ...product,
    updatedAt: new Date().toISOString(),
  };
  
  return mockProducts[index];
};

export const deleteProduct = async (id: string): Promise<void> => {
  await delay(600);
  const index = mockProducts.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Product not found");
  mockProducts.splice(index, 1);
};
