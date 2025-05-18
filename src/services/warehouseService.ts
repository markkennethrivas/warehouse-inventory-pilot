
import { Warehouse } from "@/types";
import { mockWarehouses } from "./mockData";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getWarehouses = async (): Promise<Warehouse[]> => {
  await delay(500);
  return [...mockWarehouses];
};

export const getWarehouse = async (id: string): Promise<Warehouse | undefined> => {
  await delay(300);
  return mockWarehouses.find(warehouse => warehouse.id === id);
};

export const createWarehouse = async (warehouse: Omit<Warehouse, "id" | "createdAt" | "updatedAt">): Promise<Warehouse> => {
  await delay(600);
  const newWarehouse: Warehouse = {
    id: `w${mockWarehouses.length + 1}`,
    ...warehouse,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockWarehouses.push(newWarehouse);
  return newWarehouse;
};

export const updateWarehouse = async (id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> => {
  await delay(600);
  const index = mockWarehouses.findIndex(w => w.id === id);
  if (index === -1) throw new Error("Warehouse not found");
  
  mockWarehouses[index] = {
    ...mockWarehouses[index],
    ...warehouse,
    updatedAt: new Date().toISOString(),
  };
  
  return mockWarehouses[index];
};

export const deleteWarehouse = async (id: string): Promise<void> => {
  await delay(600);
  const index = mockWarehouses.findIndex(w => w.id === id);
  if (index === -1) throw new Error("Warehouse not found");
  mockWarehouses.splice(index, 1);
};
