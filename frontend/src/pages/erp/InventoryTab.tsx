import { useEffect, useState } from 'react';
import { useERPStore, type ERPInventory } from '@/stores/erpStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InventoryTab() {
  const { inventory, loadingInventory, fetchInventory, createInventory } = useERPStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    productName: '',
    quantity: 0,
    reorderLevel: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSubmit = async () => {
    await createInventory({
      ...formData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ERPInventory);
    setFormData({ sku: '', productName: '', quantity: 0, reorderLevel: 0, unitPrice: 0 });
    setIsOpen(false);
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-edu-green-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total Items</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-green-900">{inventory.length}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-blue-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Total Units</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-blue-900">{inventory.reduce((sum, i) => sum + i.quantity, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-amber-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Inventory Value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-amber-900">
              ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-edu-rose-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-edu-gray-600">Low Stock</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-edu-rose-900">{lowStockItems.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-edu-rose-600 bg-edu-rose-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-edu-rose-600" />
              <CardTitle className="text-edu-rose-900">Low Stock Alert</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-edu-rose-800 mb-3">The following items are below reorder level:</p>
            <ul className="text-sm space-y-1">
              {lowStockItems.slice(0, 3).map(item => (
                <li key={item.id} className="text-edu-rose-700">
                  {item.productName} (SKU: {item.sku}) - {item.quantity} units remaining
                </li>
              ))}
              {lowStockItems.length > 3 && (
                <li className="text-edu-rose-600 font-semibold">+{lowStockItems.length - 3} more items</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Header with Add Button */}
      <div className="flex justify-between items-center pt-4 border-t border-edu-green-200">
        <div>
          <h2 className="text-2xl font-bold text-edu-green-900">Inventory Management</h2>
          <p className="text-edu-gray-600 mt-1">Track stock levels and product information</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-edu-green-600 hover:bg-edu-green-700">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Create a new product in inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-edu-green-900 font-semibold">SKU</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., PROD-001"
                  className="mt-1 border-edu-green-300"
                />
              </div>
              <div>
                <Label className="text-edu-green-900 font-semibold">Product Name</Label>
                <Input
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Laptop"
                  className="mt-1 border-edu-green-300"
                />
              </div>
              <div>
                <Label className="text-edu-green-900 font-semibold">Initial Quantity</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="mt-1 border-edu-green-300"
                />
              </div>
              <div>
                <Label className="text-edu-green-900 font-semibold">Reorder Level</Label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                  placeholder="Minimum quantity to trigger reorder"
                  className="mt-1 border-edu-green-300"
                />
              </div>
              <div>
                <Label className="text-edu-green-900 font-semibold">Unit Price</Label>
                <Input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="mt-1 border-edu-green-300"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-edu-green-600 hover:bg-edu-green-700">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inventory Table */}
      {loadingInventory ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </CardContent>
        </Card>
      ) : inventory.length === 0 ? (
        <Card className="border-edu-green-200 bg-edu-green-50">
          <CardContent className="pt-8 text-center">
            <p className="text-edu-gray-600">No items in inventory. Add products to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-edu-green-200">
                    <TableHead className="text-edu-green-900 font-bold">SKU</TableHead>
                    <TableHead className="text-edu-green-900 font-bold">Product Name</TableHead>
                    <TableHead className="text-edu-green-900 font-bold text-center">Quantity</TableHead>
                    <TableHead className="text-edu-green-900 font-bold text-center">Reorder Level</TableHead>
                    <TableHead className="text-edu-green-900 font-bold text-right">Unit Price</TableHead>
                    <TableHead className="text-edu-green-900 font-bold text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map(item => {
                    const isLowStock = item.quantity <= item.reorderLevel;
                    return (
                      <TableRow 
                        key={item.id} 
                        className={`border-edu-green-100 ${isLowStock ? 'bg-edu-rose-50 hover:bg-edu-rose-100' : 'hover:bg-edu-green-50'}`}
                      >
                        <TableCell className="font-mono font-bold text-edu-green-600">{item.sku}</TableCell>
                        <TableCell className="font-semibold text-edu-gray-900">{item.productName}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-bold ${isLowStock ? 'text-edu-rose-700' : 'text-edu-green-700'}`}>
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-edu-amber-700">{item.reorderLevel}</TableCell>
                        <TableCell className="text-right font-mono">${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-edu-green-700">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
