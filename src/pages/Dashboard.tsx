
import { useQuery } from "@tanstack/react-query";
import { getStocksWithDetails, getLowStockItems } from "@/services/stockService";
import { getWarehouses } from "@/services/warehouseService";
import { getProducts } from "@/services/productService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { Package, Building2, Boxes, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses
  });
  
  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: getStocksWithDetails
  });
  
  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery({
    queryKey: ['lowStockItems'],
    queryFn: getLowStockItems
  });
  
  const isLoading = productsLoading || warehousesLoading || stocksLoading || lowStockLoading;
  
  // Calculate total inventory value
  const totalInventoryValue = stocks?.reduce((sum, stock) => {
    const product = products?.find(p => p.id === stock.productId);
    return sum + (product ? product.costPrice * stock.quantity : 0);
  }, 0) || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}!</p>
        </div>
        <Button asChild>
          <Link to="/stock/transfer">New Stock Transfer</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Summary Cards */}
        <Card className="dashboard-card animated-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Products</p>
              {isLoading ? (
                <Skeleton className="h-9 w-20 mt-1" />
              ) : (
                <h3 className="text-3xl font-bold">{products?.length || 0}</h3>
              )}
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card animated-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Warehouses</p>
              {isLoading ? (
                <Skeleton className="h-9 w-20 mt-1" />
              ) : (
                <h3 className="text-3xl font-bold">{warehouses?.length || 0}</h3>
              )}
            </div>
            <div className="bg-secondary/10 p-3 rounded-full">
              <Building2 className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card animated-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Stock Items</p>
              {isLoading ? (
                <Skeleton className="h-9 w-20 mt-1" />
              ) : (
                <h3 className="text-3xl font-bold">{stocks?.length || 0}</h3>
              )}
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Boxes className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card animated-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Inventory Value</p>
              {isLoading ? (
                <Skeleton className="h-9 w-36 mt-1" />
              ) : (
                <h3 className="text-3xl font-bold">${totalInventoryValue.toFixed(2)}</h3>
              )}
            </div>
            <div className="bg-green-500/10 p-3 rounded-full">
              <span className="text-green-500 font-semibold text-lg">$</span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Low Stock Alerts */}
      <Card className="dashboard-card animated-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-xl font-bold">Low Stock Alerts</h2>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/stock">View All Stock</Link>
          </Button>
        </div>
        
        {lowStockLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : lowStockItems && lowStockItems.length > 0 ? (
          <div className="divide-y">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{item.product.name}</h4>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      SKU: {item.product.sku}
                    </span>
                    <span className="text-muted-foreground">
                      Warehouse: {item.warehouse.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium ${item.quantity === 0 ? "text-destructive" : "text-warning"}`}>
                        {item.quantity}
                      </span>
                      <span>/ {item.product.minStockThreshold}</span>
                    </div>
                    <div className="h-1.5 w-24 bg-muted rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full ${
                          item.quantity === 0 ? "bg-destructive" : "bg-warning"
                        }`} 
                        style={{ 
                          width: `${Math.min(100, (item.quantity / item.product.minStockThreshold) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Restock</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No low stock items found!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
