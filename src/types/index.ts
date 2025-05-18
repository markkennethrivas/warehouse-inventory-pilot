
export type UserRole = "admin" | "warehouseManager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  supplier: string;
  costPrice: number;
  sellingPrice: number;
  minStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  lastUpdated: string;
}

export interface StockWithDetails extends Stock {
  product: Product;
  warehouse: Warehouse;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  status: "pending" | "inTransit" | "completed";
  movementDate: string;
  updatedAt: string;
}

export interface StockMovementWithDetails extends StockMovement {
  product: Product;
  sourceWarehouse: Warehouse;
  destinationWarehouse: Warehouse;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: "draft" | "placed" | "received" | "canceled";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}
