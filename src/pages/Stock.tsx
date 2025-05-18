
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStocksWithDetails } from "@/services/stockService";
import { getWarehouses } from "@/services/warehouseService";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Boxes, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Warehouse } from "@/types";

const StockPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  
  const { data: stocks, isLoading: stocksLoading } = useQuery({
    queryKey: ['stocksWithDetails'],
    queryFn: getStocksWithDetails
  });
  
  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses
  });
  
  const isLoading = stocksLoading || warehousesLoading;
  
  const filteredStocks = stocks?.filter(stock => {
    const matchesSearch = 
      stock.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.warehouse.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWarehouse = warehouseFilter === "all" || stock.warehouseId === warehouseFilter;
    
    const matchesLowStock = !lowStockOnly || stock.quantity <= stock.product.minStockThreshold;
    
    return matchesSearch && matchesWarehouse && matchesLowStock;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Boxes className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Stock</h1>
        </div>
        <Button asChild>
          <Link to="/stock/transfer">
            <ArrowRight className="mr-2 h-4 w-4" />
            Transfer Stock
          </Link>
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by product name, SKU or warehouse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-[200px]">
              <Select 
                value={warehouseFilter} 
                onValueChange={(value) => setWarehouseFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Warehouses</SelectLabel>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses?.map((warehouse: Warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant={lowStockOnly ? "secondary" : "outline"}
              onClick={() => setLowStockOnly(!lowStockOnly)}
            >
              {lowStockOnly ? "Showing Low Stock" : "Show Low Stock"}
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Product</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks && filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => {
                    const isLowStock = stock.quantity <= stock.product.minStockThreshold;
                    const isOutOfStock = stock.quantity === 0;
                    
                    return (
                      <TableRow key={stock.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{stock.product.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {stock.product.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>{stock.warehouse.name}</TableCell>
                        <TableCell className="text-right font-medium">
                          {stock.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {stock.product.minStockThreshold}
                        </TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning" className="bg-warning text-warning-foreground">Low Stock</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {new Date(stock.lastUpdated).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No stock items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StockPage;
