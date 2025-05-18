
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";
import { getWarehouses } from "@/services/warehouseService";
import { getStocksByProduct, moveStock } from "@/services/stockService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { StockWithDetails } from "@/types";

const StockTransfer = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedSourceWarehouseId, setSelectedSourceWarehouseId] = useState<string>("");
  const [selectedDestWarehouseId, setSelectedDestWarehouseId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [availableQuantity, setAvailableQuantity] = useState<number>(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });
  
  const { data: warehouses, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses
  });
  
  const { data: productStocks, isLoading: stocksLoading } = useQuery({
    queryKey: ['productStocks', selectedProductId],
    queryFn: () => selectedProductId ? getStocksByProduct(selectedProductId) : Promise.resolve([]),
    enabled: !!selectedProductId
  });
  
  // Find warehouses that have this product in stock
  const warehousesWithStock = productStocks || [];
  
  // Filter out warehouses that already have this product for destination choices
  const availableSourceWarehouses = warehousesWithStock.filter(
    stock => stock.quantity > 0
  );
  
  // When product is selected, reset warehouse selections
  const handleProductChange = (value: string) => {
    setSelectedProductId(value);
    setSelectedSourceWarehouseId("");
    setSelectedDestWarehouseId("");
    setQuantity(1);
    setAvailableQuantity(0);
  };
  
  // When source warehouse is selected, update available quantity
  const handleSourceWarehouseChange = (value: string) => {
    setSelectedSourceWarehouseId(value);
    setSelectedDestWarehouseId("");
    
    const selectedStock = warehousesWithStock.find(stock => stock.warehouseId === value);
    if (selectedStock) {
      setAvailableQuantity(selectedStock.quantity);
      setQuantity(1);
    } else {
      setAvailableQuantity(0);
      setQuantity(0);
    }
  };
  
  // Transfer stock mutation
  const transferMutation = useMutation({
    mutationFn: () => moveStock(
      selectedProductId,
      quantity,
      selectedSourceWarehouseId,
      selectedDestWarehouseId
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productStocks'] });
      queryClient.invalidateQueries({ queryKey: ['stocksWithDetails'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockItems'] });
      toast({ 
        title: "Stock transfer successful", 
        description: "The stock has been transferred successfully." 
      });
      navigate("/stock");
    },
    onError: (error) => {
      toast({
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "An error occurred during transfer",
        variant: "destructive"
      });
    }
  });
  
  const handleTransfer = () => {
    if (!selectedProductId || !selectedSourceWarehouseId || !selectedDestWarehouseId || quantity <= 0) {
      toast({
        title: "Invalid transfer",
        description: "Please fill out all fields correctly",
        variant: "destructive"
      });
      return;
    }
    
    setIsConfirmOpen(true);
  };
  
  const confirmTransfer = () => {
    transferMutation.mutate();
    setIsConfirmOpen(false);
  };
  
  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const sourceWarehouse = warehouses?.find(w => w.id === selectedSourceWarehouseId);
  const destWarehouse = warehouses?.find(w => w.id === selectedDestWarehouseId);
  
  const isLoading = productsLoading || warehousesLoading || (!!selectedProductId && stocksLoading);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transfer Stock</h1>
        <Button variant="outline" onClick={() => navigate("/stock")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stock
        </Button>
      </div>
      
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>Stock Transfer</CardTitle>
          <CardDescription>
            Move products between warehouses. Select a product, source warehouse, destination warehouse, and the quantity to transfer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProductId} onValueChange={handleProductChange}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Products</SelectLabel>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (SKU: {product.sku})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Source Warehouse Selection */}
              <div className="space-y-2">
                <Label htmlFor="sourceWarehouse">Source Warehouse</Label>
                <Select 
                  value={selectedSourceWarehouseId} 
                  onValueChange={handleSourceWarehouseChange}
                  disabled={!selectedProductId || availableSourceWarehouses.length === 0}
                >
                  <SelectTrigger id="sourceWarehouse">
                    <SelectValue placeholder={
                      !selectedProductId ? "Select a product first" : 
                      availableSourceWarehouses.length === 0 ? 
                      "No warehouses have this product" : 
                      "Select source warehouse"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Warehouses with Stock</SelectLabel>
                      {availableSourceWarehouses.map((stock: StockWithDetails) => (
                        <SelectItem key={stock.warehouseId} value={stock.warehouseId}>
                          {stock.warehouse.name} ({stock.quantity} in stock)
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Destination Warehouse Selection */}
              <div className="space-y-2">
                <Label htmlFor="destWarehouse">Destination Warehouse</Label>
                <Select 
                  value={selectedDestWarehouseId} 
                  onValueChange={(value) => setSelectedDestWarehouseId(value)}
                  disabled={!selectedSourceWarehouseId}
                >
                  <SelectTrigger id="destWarehouse">
                    <SelectValue placeholder={
                      !selectedSourceWarehouseId ? "Select source warehouse first" : "Select destination warehouse"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Warehouses</SelectLabel>
                      {warehouses
                        ?.filter(warehouse => warehouse.id !== selectedSourceWarehouseId)
                        .map(warehouse => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Quantity Input */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="quantity">Quantity to Transfer</Label>
                  {selectedSourceWarehouseId && (
                    <span className="text-sm text-muted-foreground">
                      Available: {availableQuantity}
                    </span>
                  )}
                </div>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={availableQuantity}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setQuantity(isNaN(value) ? 0 : Math.min(value, availableQuantity));
                  }}
                  disabled={!selectedDestWarehouseId || availableQuantity <= 0}
                />
              </div>
              
              {/* Transfer Summary */}
              {selectedProductId && selectedSourceWarehouseId && selectedDestWarehouseId && (
                <div className="mt-6 bg-muted/50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Transfer Summary</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Product:</span> {selectedProduct?.name} (SKU: {selectedProduct?.sku})</p>
                    <div className="flex items-center gap-2 my-2">
                      <div className="bg-muted p-2 rounded">
                        {sourceWarehouse?.name}
                      </div>
                      <ArrowRight className="h-4 w-4" />
                      <div className="bg-muted p-2 rounded">
                        {destWarehouse?.name}
                      </div>
                    </div>
                    <p><span className="font-medium">Quantity:</span> {quantity}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/stock")}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={
              !selectedProductId || 
              !selectedSourceWarehouseId || 
              !selectedDestWarehouseId || 
              quantity <= 0 || 
              quantity > availableQuantity ||
              transferMutation.isPending
            }
          >
            {transferMutation.isPending ? "Transferring..." : "Transfer Stock"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Stock Transfer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer {quantity} units of {selectedProduct?.name} from {sourceWarehouse?.name} to {destWarehouse?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmTransfer}>
              Confirm Transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StockTransfer;
