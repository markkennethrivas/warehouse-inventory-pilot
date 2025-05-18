
import { Stock, StockWithDetails, StockMovement } from "@/types";
import { mockStocks, mockStockMovements, mockProducts, mockWarehouses } from "./mockData";

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getStocks = async (): Promise<Stock[]> => {
  await delay(500);
  return [...mockStocks];
};

export const getStocksWithDetails = async (): Promise<StockWithDetails[]> => {
  await delay(700);
  return mockStocks.map(stock => {
    const product = mockProducts.find(p => p.id === stock.productId)!;
    const warehouse = mockWarehouses.find(w => w.id === stock.warehouseId)!;
    
    return {
      ...stock,
      product,
      warehouse
    };
  });
};

export const getStocksByWarehouse = async (warehouseId: string): Promise<StockWithDetails[]> => {
  await delay(500);
  const warehouseStocks = mockStocks.filter(stock => stock.warehouseId === warehouseId);
  
  return warehouseStocks.map(stock => {
    const product = mockProducts.find(p => p.id === stock.productId)!;
    const warehouse = mockWarehouses.find(w => w.id === stock.warehouseId)!;
    
    return {
      ...stock,
      product,
      warehouse
    };
  });
};

export const getStocksByProduct = async (productId: string): Promise<StockWithDetails[]> => {
  await delay(500);
  const productStocks = mockStocks.filter(stock => stock.productId === productId);
  
  return productStocks.map(stock => {
    const product = mockProducts.find(p => p.id === stock.productId)!;
    const warehouse = mockWarehouses.find(w => w.id === stock.warehouseId)!;
    
    return {
      ...stock,
      product,
      warehouse
    };
  });
};

export const getLowStockItems = async (): Promise<StockWithDetails[]> => {
  await delay(700);
  const lowStockItems: StockWithDetails[] = [];
  
  mockStocks.forEach(stock => {
    const product = mockProducts.find(p => p.id === stock.productId);
    const warehouse = mockWarehouses.find(w => w.id === stock.warehouseId);
    
    if (product && warehouse && stock.quantity <= product.minStockThreshold) {
      lowStockItems.push({
        ...stock,
        product,
        warehouse
      });
    }
  });
  
  return lowStockItems;
};

export const updateStock = async (id: string, quantity: number): Promise<Stock> => {
  await delay(500);
  const index = mockStocks.findIndex(stock => stock.id === id);
  if (index === -1) throw new Error("Stock not found");
  
  mockStocks[index] = {
    ...mockStocks[index],
    quantity,
    lastUpdated: new Date().toISOString()
  };
  
  return mockStocks[index];
};

export const moveStock = async (
  productId: string, 
  quantity: number, 
  sourceWarehouseId: string, 
  destinationWarehouseId: string
): Promise<StockMovement> => {
  await delay(800);
  
  // Create new movement record
  const newMovement: StockMovement = {
    id: `m${mockStockMovements.length + 1}`,
    productId,
    quantity,
    sourceWarehouseId,
    destinationWarehouseId,
    status: "pending",
    movementDate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockStockMovements.push(newMovement);
  
  // Update source warehouse stock
  const sourceStockIndex = mockStocks.findIndex(
    s => s.productId === productId && s.warehouseId === sourceWarehouseId
  );
  
  if (sourceStockIndex !== -1) {
    if (mockStocks[sourceStockIndex].quantity < quantity) {
      throw new Error("Insufficient stock in source warehouse");
    }
    
    mockStocks[sourceStockIndex] = {
      ...mockStocks[sourceStockIndex],
      quantity: mockStocks[sourceStockIndex].quantity - quantity,
      lastUpdated: new Date().toISOString()
    };
  } else {
    throw new Error("Product not found in source warehouse");
  }
  
  // Update destination warehouse stock
  const destStockIndex = mockStocks.findIndex(
    s => s.productId === productId && s.warehouseId === destinationWarehouseId
  );
  
  if (destStockIndex !== -1) {
    mockStocks[destStockIndex] = {
      ...mockStocks[destStockIndex],
      quantity: mockStocks[destStockIndex].quantity + quantity,
      lastUpdated: new Date().toISOString()
    };
  } else {
    // Create new stock entry in destination warehouse
    mockStocks.push({
      id: `s${mockStocks.length + 1}`,
      productId,
      warehouseId: destinationWarehouseId,
      quantity,
      lastUpdated: new Date().toISOString()
    });
  }
  
  // Update movement status to completed
  const movementIndex = mockStockMovements.findIndex(m => m.id === newMovement.id);
  mockStockMovements[movementIndex] = {
    ...mockStockMovements[movementIndex],
    status: "completed",
    updatedAt: new Date().toISOString()
  };
  
  return mockStockMovements[movementIndex];
};

export const getStockMovements = async (): Promise<StockMovement[]> => {
  await delay(600);
  return [...mockStockMovements];
};
